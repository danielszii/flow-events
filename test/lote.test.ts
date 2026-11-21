import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { Evento } from "../src/dominio/entidades/Evento";
import { Lote } from "../src/dominio/entidades/Lote";
import { LoteInvalidoError } from "../src/dominio/erros/LoteInvalidoError";
import { EventoRepositorio } from "../src/dominio/repositorios/EventoRepositorio";
import { LoteRepositorio } from "../src/dominio/repositorios/LoteRepositorio";
import { CreateLote } from "../src/aplicacao/usecase/lote/CreateLote";
import { ListLotes } from "../src/aplicacao/usecase/lote/ListLotes";
import { LoteControle } from "../src/infra/web/express/controle/LoteControle";
import { createLoteRoutes } from "../src/infra/web/express/routes/LoteRoutes";

const inicioVenda = "2030-01-01T00:00:00.000Z";
const fimVenda = "2030-02-01T00:00:00.000Z";

function criarLote(
  eventoId = "evento-1",
  nome = "Lote 1",
  preco = 25,
  quantidade = 20,
  inicio = inicioVenda,
  fim = fimVenda,
): Lote {
  return Lote.create(eventoId, nome, preco, quantidade, inicio, fim);
}

function criarDependencias() {
  const evento = Evento.create(
    "Evento de teste",
    "Descrição",
    "2030-01-01T00:00:00.000Z",
    "2030-12-31T23:59:59.000Z",
    4,
  );
  const lotes: Lote[] = [];

  const eventoRepositorio: EventoRepositorio = {
    buscarPorId: async (id) => id === evento.id ? evento : null,
    listar: async () => [evento],
    salvar: async () => {},
    remover: async () => true,
    atualizar: async () => {},
  };
  const loteRepositorio: LoteRepositorio = {
    buscarPorId: async (id) => lotes.find((lote) => lote.id === id) ?? null,
    listarPorEvento: async (eventoId) => lotes.filter((lote) => lote.evento_id === eventoId),
    salvar: async (lote) => {
      lotes.push(lote);
    },
  };

  return {
    evento,
    lotes,
    eventoRepositorio,
    loteRepositorio,
    controle: new LoteControle(
      new CreateLote(loteRepositorio, eventoRepositorio),
      new ListLotes(loteRepositorio, eventoRepositorio),
    ),
  };
}

test("Lote valida campos e período de vendas", () => {
  const lote = criarLote();
  assert.equal(lote.quantidade_total, 20);
  assert.throws(() => criarLote("", "Lote 1"), LoteInvalidoError);
  assert.throws(() => criarLote("evento-1", " "), LoteInvalidoError);
  assert.throws(() => criarLote("evento-1", "Lote 1", -1), LoteInvalidoError);
  assert.throws(() => criarLote("evento-1", "Lote 1", 25, 0), LoteInvalidoError);
  assert.throws(
    () => criarLote("evento-1", "Lote 1", 25, 20, fimVenda, inicioVenda),
    LoteInvalidoError,
  );
});

test("janela de venda inclui início e exclui fim", () => {
  const lote = criarLote();
  assert.equal(lote.vendasAbertasEm(new Date(inicioVenda)), true);
  assert.equal(lote.vendasAbertasEm(new Date("2030-01-15T00:00:00.000Z")), true);
  assert.equal(lote.vendasAbertasEm(new Date(fimVenda)), false);
});

test("HTTP cria e lista lotes através dos casos de uso", async (t) => {
  const { evento, lotes, controle } = criarDependencias();
  const app = express();
  app.use(express.json());
  app.use(createLoteRoutes(controle));

  const server = app.listen(0);
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise<void>((resolve) => server.once("listening", resolve));

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Servidor de teste não abriu uma porta TCP");
  }
  const url = `http://127.0.0.1:${address.port}/eventos/${evento.id}/lotes`;

  const createResponse = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      nome: "Lote 1",
      preco: 25,
      quantidade_total: 20,
      data_hora_inicio_venda: inicioVenda,
      data_hora_fim_venda: fimVenda,
    }),
  });
  assert.equal(createResponse.status, 201);
  assert.equal(lotes.length, 1);

  const listResponse = await fetch(url);
  assert.equal(listResponse.status, 200);
  const listBody = await listResponse.json();
  assert.equal(listBody.lotes.length, 1);

  const invalidResponse = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      nome: "Lote inválido",
      preco: 25,
      quantidade_total: 0,
      data_hora_inicio_venda: inicioVenda,
      data_hora_fim_venda: fimVenda,
    }),
  });
  assert.equal(invalidResponse.status, 400);
});

test("HTTP retorna 404 para evento inexistente", async (t) => {
  const { controle } = criarDependencias();
  const app = express();
  app.use(express.json());
  app.use(createLoteRoutes(controle));

  const server = app.listen(0);
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  await new Promise<void>((resolve) => server.once("listening", resolve));

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Servidor de teste não abriu uma porta TCP");
  }
  const response = await fetch(
    `http://127.0.0.1:${address.port}/eventos/inexistente/lotes`,
  );
  assert.equal(response.status, 404);
});
