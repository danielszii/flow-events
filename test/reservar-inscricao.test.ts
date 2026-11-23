import assert from "node:assert/strict";
import { test } from "node:test";
import express from "express";
import { ReservarInscricao } from "../src/aplicacao/usecase/inscricao/ReservarInscricao";
import { CancelarInscricao } from "../src/aplicacao/usecase/inscricao/CancelarInscricao";
import { ExpirarInscricoesPendentes } from "../src/aplicacao/usecase/inscricao/ExpirarInscricoesPendentes";
import { PromoverFilaEspera } from "../src/aplicacao/usecase/inscricao/PromoverFilaEspera";
import { ReservaInscricaoError } from "../src/aplicacao/erros/ReservaInscricaoError";
import { EstadoEvento, Evento } from "../src/dominio/entidades/Evento";
import { Inscricao } from "../src/dominio/entidades/Inscricao";
import { FilaEspera } from "../src/dominio/entidades/FilaEspera";
import { Lote } from "../src/dominio/entidades/Lote";
import { Usuario } from "../src/dominio/entidades/Usuario";
import { EventoRepositorio } from "../src/dominio/repositorios/EventoRepositorio";
import { InscricaoRepositorio } from "../src/dominio/repositorios/InscricaoRepositorio";
import { FilaEsperaRepositorio } from "../src/dominio/repositorios/FilaEsperaRepositorio";
import { FilaEsperaRepositorioMemoria } from "../src/infra/bd/memoria/FilaEsperaRepositorioMemoria";
import { LoteRepositorio } from "../src/dominio/repositorios/LoteRepositorio";
import { UsuarioRepositorio } from "../src/dominio/repositorios/UsuarioRepositorio";
import { InscricaoControle } from "../src/infra/web/express/controle/InscricaoControle";
import { createInscricaoRoutes } from "../src/infra/web/express/routes/InscricaoRoutes";

const agora = new Date("2030-01-15T12:00:00.000Z");

function criarContexto() {
  const usuario = Usuario.create("12345678901", "Ana", "ana@example.com");
  const evento = Evento.create(
    "Evento",
    "Descrição",
    "2030-01-01T00:00:00.000Z",
    "2030-12-31T23:59:59.000Z",
    2,
  );
  evento.publicar();
  const lote = Lote.create(
    evento.id,
    "Lote 1",
    50,
    2,
    "2030-01-01T00:00:00.000Z",
    "2030-02-01T00:00:00.000Z",
  );

  const usuarios = new Map([[usuario.id, usuario]]);
  const eventos = new Map([[evento.id, evento]]);
  const lotes = new Map([[lote.id, lote]]);
  const inscricoes: Inscricao[] = [];
  const entradasFila: FilaEspera[] = [];

  const usuarioRepositorio: UsuarioRepositorio = {
    buscarPorId: async (id) => usuarios.get(id) ?? null,
    listar: async () => [...usuarios.values()],
    salvar: async (value) => { usuarios.set(value.id, value); },
    deletar: async (id) => { usuarios.delete(id); },
    atualizar: async (value) => { usuarios.set(value.id, value); },
  };
  const eventoRepositorio: EventoRepositorio = {
    buscarPorId: async (id) => eventos.get(id) ?? null,
    listar: async () => [...eventos.values()],
    salvar: async (value) => { eventos.set(value.id, value); },
    remover: async (id) => eventos.delete(id),
    atualizar: async (value) => { eventos.set(value.id, value); },
  };
  const loteRepositorio: LoteRepositorio = {
    buscarPorId: async (id) => lotes.get(id) ?? null,
    listarPorEvento: async (eventoId) => [...lotes.values()].filter((value) => value.evento_id === eventoId),
    salvar: async (value) => { lotes.set(value.id, value); },
  };
  const inscricaoRepositorio: InscricaoRepositorio = {
    buscarPorId: async (id) => inscricoes.find((value) => value.id === id) ?? null,
    listarPorUsuario: async (usuarioId) => inscricoes.filter((value) => value.usuario_id === usuarioId),
    listarPorCpfEEvento: async (cpf, eventoId) => {
      const usuarioIds = [...usuarios.values()]
        .filter((value) => value.cpf === cpf)
        .map((value) => value.id);
      return inscricoes.filter((value) => (
        value.evento_id === eventoId && usuarioIds.includes(value.usuario_id)
      ));
    },
    listarPorLote: async (loteId) => inscricoes.filter((value) => value.lote_id === loteId),
    listarPendentesExpiradas: async (ate) => inscricoes.filter((value) => (
      value.estado === "PENDENTE" && new Date(value.expira_em).getTime() <= ate.getTime()
    )),
    salvar: async (value) => { inscricoes.push(value); },
    atualizar: async (value) => {
      const index = inscricoes.findIndex((item) => item.id === value.id);
      if (index >= 0) inscricoes[index] = value;
    },
  };
  const filaEsperaRepositorio: FilaEsperaRepositorio = {
    buscarPorUsuarioELote: async (usuarioId, loteId) => (
      entradasFila.find((entrada) => (
        entrada.usuario_id === usuarioId && entrada.lote_id === loteId
      )) ?? null
    ),
    listarPorLoteEmOrdemDeEntrada: async (loteId) => [...entradasFila]
      .filter((entrada) => entrada.lote_id === loteId)
      .sort((a, b) => Date.parse(a.criado_em) - Date.parse(b.criado_em)),
    salvar: async (entrada) => { entradasFila.push(entrada); },
    remover: async (id) => {
      const index = entradasFila.findIndex((entrada) => entrada.id === id);
      if (index < 0) throw new Error(`Entrada de fila ${id} não encontrada`);
      entradasFila.splice(index, 1);
    },
  };
  const promotorFilaEspera = new PromoverFilaEspera(
    inscricaoRepositorio,
    filaEsperaRepositorio,
    loteRepositorio,
    usuarioRepositorio,
    eventoRepositorio,
    () => agora,
  );

  return {
    usuario,
    evento,
    lote,
    usuarios,
    eventos,
    lotes,
    inscricoes,
    entradasFila,
    inscricaoRepositorio,
    promotorFilaEspera,
    useCase: new ReservarInscricao(
      usuarioRepositorio,
      eventoRepositorio,
      loteRepositorio,
      inscricaoRepositorio,
      filaEsperaRepositorio,
      promotorFilaEspera,
      () => agora,
    ),
  };
}

function esperarErro(
  promise: Promise<unknown>,
  codigo: ReservaInscricaoError["codigo"],
): Promise<void> {
  return assert.rejects(promise, (error: unknown) => (
    error instanceof ReservaInscricaoError && error.codigo === codigo
  ));
}

test("reserva ingresso para evento publicado e lote com vendas abertas", async () => {
  const contexto = criarContexto();

  const resultado = await contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  });

  assert.equal(resultado.estado, "PENDENTE");
  assert.equal(resultado.expira_em, "2030-01-15T12:10:00.000Z");
  assert.equal(contexto.inscricoes.length, 1);
});

test("rejeita usuário inexistente", async () => {
  const contexto = criarContexto();

  await esperarErro(contexto.useCase.execute({
    usuario_id: "inexistente",
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  }), "USUARIO_NAO_ENCONTRADO");
});

test("rejeita evento que não está publicado", async () => {
  const contexto = criarContexto();
  const rascunho = Evento.create("Rascunho", "Descrição", "2030-01-01", "2030-12-31", 2);
  const loteRascunho = Lote.create(
    rascunho.id,
    "Lote do rascunho",
    50,
    2,
    "2030-01-01T00:00:00.000Z",
    "2030-02-01T00:00:00.000Z",
  );
  contexto.eventos.set(rascunho.id, rascunho);
  contexto.lotes.set(loteRascunho.id, loteRascunho);

  await esperarErro(contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: rascunho.id,
    lote_id: loteRascunho.id,
  }), "EVENTO_NAO_PUBLICADO");
});

test("rejeita lote associado a outro evento", async () => {
  const contexto = criarContexto();
  const outroLote = Lote.create(
    "outro-evento",
    "Outro lote",
    50,
    2,
    "2030-01-01T00:00:00.000Z",
    "2030-02-01T00:00:00.000Z",
  );
  contexto.lotes.set(outroLote.id, outroLote);

  await esperarErro(contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: outroLote.id,
  }), "LOTE_NAO_PERTENCE_AO_EVENTO");
});

test("rejeita lote fora do período de vendas", async () => {
  const contexto = criarContexto();
  const closedLot = Lote.create(
    contexto.evento.id,
    "Lote encerrado",
    50,
    2,
    "2030-01-01T00:00:00.000Z",
    "2030-01-10T00:00:00.000Z",
  );
  const useCase = new ReservarInscricao(
    {
      buscarPorId: async () => contexto.usuario,
      listar: async () => [contexto.usuario],
      salvar: async () => {},
      deletar: async () => {},
      atualizar: async () => {},
    },
    {
      buscarPorId: async () => contexto.evento,
      listar: async () => [contexto.evento],
      salvar: async () => {},
      remover: async () => true,
      atualizar: async () => {},
    },
    {
      buscarPorId: async () => closedLot,
      listarPorEvento: async () => [closedLot],
      salvar: async () => {},
    },
    {
      buscarPorId: async () => null,
      listarPorUsuario: async () => [],
      listarPorCpfEEvento: async () => [],
      listarPorLote: async () => [],
      listarPendentesExpiradas: async () => [],
      salvar: async () => {},
      atualizar: async () => {},
    },
    {
      buscarPorUsuarioELote: async () => null,
      listarPorLoteEmOrdemDeEntrada: async () => [],
      salvar: async () => {},
      remover: async () => {},
    },
    { execute: async () => null },
    () => agora,
  );

  await esperarErro(useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: closedLot.id,
  }), "VENDAS_FECHADAS");
});

test("adiciona à fila quando não há capacidade no lote", async () => {
  const contexto = criarContexto();
  contexto.inscricoes.push(
    Inscricao.create("outro-usuario", contexto.evento.id, contexto.lote.id, new Date("2030-01-15T11:55:00Z")),
    Inscricao.create("outro-usuario-2", contexto.evento.id, contexto.lote.id, new Date("2030-01-15T11:56:00Z")),
  );

  const resultado = await contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  });

  assert.equal(resultado.tipo, "FILA_ESPERA");
  assert.equal(resultado.estado, "AGUARDANDO");
  assert.equal(contexto.inscricoes.length, 2);
  assert.equal(contexto.entradasFila.length, 1);
});

test("promove a primeira pessoa da fila após cancelamento e cria uma reserva", async () => {
  const contexto = criarContexto();
  const usuarioFila = Usuario.create("12345678902", "Bia", "bia@example.com");
  const usuarioSeguinte = Usuario.create("12345678903", "Caio", "caio@example.com");
  contexto.usuarios.set(usuarioFila.id, usuarioFila);
  contexto.usuarios.set(usuarioSeguinte.id, usuarioSeguinte);
  const cancelada = Inscricao.create(
    contexto.usuario.id,
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:55:00Z"),
  );
  const ocupada = Inscricao.create(
    "outro-usuario",
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:56:00Z"),
  );
  contexto.inscricoes.push(cancelada, ocupada);
  const entradaSeguinte = FilaEspera.create(
    usuarioSeguinte.id,
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:53:00Z"),
  );
  const primeiraEntrada = FilaEspera.create(
    usuarioFila.id,
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:52:00Z"),
  );
  contexto.entradasFila.push(entradaSeguinte, primeiraEntrada);

  const resultado = await new CancelarInscricao(
    contexto.inscricaoRepositorio,
    contexto.promotorFilaEspera,
    () => agora,
  ).execute({ id: cancelada.id });

  const inscricaoPromovidaId = resultado.inscricao_promovida_id;
  assert.ok(inscricaoPromovidaId);
  assert.deepEqual(contexto.entradasFila.map((entrada) => entrada.id), [entradaSeguinte.id]);
  const promovida = await contexto.inscricaoRepositorio.buscarPorId(inscricaoPromovidaId);
  assert.equal(promovida?.usuario_id, usuarioFila.id);
  assert.equal(promovida?.estado, "PENDENTE");
  assert.equal(promovida?.expira_em, "2030-01-15T12:10:00.000Z");
});

test("nova reserva não ultrapassa quem já está na fila", async () => {
  const contexto = criarContexto();
  const usuarioFila = Usuario.create("12345678904", "Dani", "dani@example.com");
  const usuarioNovo = Usuario.create("12345678905", "Eva", "eva@example.com");
  contexto.usuarios.set(usuarioFila.id, usuarioFila);
  contexto.usuarios.set(usuarioNovo.id, usuarioNovo);
  contexto.inscricoes.push(Inscricao.create(
    "outro-usuario",
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:56:00Z"),
  ));
  contexto.entradasFila.push(FilaEspera.create(
    usuarioFila.id,
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:52:00Z"),
  ));

  const resultado = await contexto.useCase.execute({
    usuario_id: usuarioNovo.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  });

  assert.equal(resultado.tipo, "FILA_ESPERA");
  assert.equal(contexto.inscricoes.some((inscricao) => (
    inscricao.usuario_id === usuarioFila.id && inscricao.estado === "PENDENTE"
  )), true);
  assert.equal(contexto.entradasFila.length, 1);
  assert.equal(contexto.entradasFila[0].usuario_id, usuarioNovo.id);
});

test("promove da fila ao expirar uma reserva pendente", async () => {
  const contexto = criarContexto();
  const usuarioFila = Usuario.create("12345678903", "Caio", "caio@example.com");
  contexto.usuarios.set(usuarioFila.id, usuarioFila);
  const vencida = Inscricao.create(
    contexto.usuario.id,
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:50:00Z"),
  );
  const ocupada = Inscricao.create(
    "outro-usuario",
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:51:00Z"),
  );
  contexto.inscricoes.push(vencida, ocupada);
  contexto.entradasFila.push(FilaEspera.create(
    usuarioFila.id,
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:52:00Z"),
  ));

  const resultado = await new ExpirarInscricoesPendentes(
    contexto.inscricaoRepositorio,
    contexto.promotorFilaEspera,
    () => agora,
  ).execute();

  assert.equal(resultado.quantidade_expirada, 1);
  assert.equal(resultado.quantidade_promovida, 1);
  assert.equal(contexto.entradasFila.length, 0);
  const reservaPromovida = contexto.inscricoes.find(
    (inscricao) => inscricao.usuario_id === usuarioFila.id,
  );
  assert.equal(reservaPromovida?.estado, "PENDENTE");
});

test("não permite inserir o mesmo usuário duas vezes na fila do lote", async () => {
  const contexto = criarContexto();
  contexto.inscricoes.push(
    Inscricao.create("outro-usuario", contexto.evento.id, contexto.lote.id, new Date("2030-01-15T11:55:00Z")),
    Inscricao.create("outro-usuario-2", contexto.evento.id, contexto.lote.id, new Date("2030-01-15T11:56:00Z")),
  );
  await contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  });

  await esperarErro(contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  }), "JA_NA_FILA");
  assert.equal(contexto.entradasFila.length, 1);
});

test("lista a fila do lote em ordem de chegada e preserva a ordem em empates", async () => {
  const repositorio = new FilaEsperaRepositorioMemoria();
  const primeiro = FilaEspera.create(
    "usuario-primeiro",
    "evento",
    "lote",
    new Date("2030-01-15T12:00:00.000Z"),
  );
  const segundo = FilaEspera.create(
    "usuario-segundo",
    "evento",
    "lote",
    new Date("2030-01-15T12:01:00.000Z"),
  );
  const terceiro = FilaEspera.create(
    "usuario-terceiro",
    "evento",
    "lote",
    new Date("2030-01-15T12:01:00.000Z"),
  );
  const outroLote = FilaEspera.create(
    "usuario-outro-lote",
    "evento",
    "outro-lote",
    new Date("2030-01-15T11:00:00.000Z"),
  );

  await repositorio.salvar(segundo);
  await repositorio.salvar(outroLote);
  await repositorio.salvar(terceiro);
  await repositorio.salvar(primeiro);

  const entradas = await repositorio.listarPorLoteEmOrdemDeEntrada("lote");
  assert.deepEqual(entradas.map((entrada) => entrada.id), [
    primeiro.id,
    segundo.id,
    terceiro.id,
  ]);
});

test("rejeita reserva ao atingir limite por CPF entre lotes", async () => {
  const contexto = criarContexto();
  contexto.inscricoes.push(
    Inscricao.create(contexto.usuario.id, contexto.evento.id, "outro-lote-1", new Date("2030-01-15T11:55:00Z")),
    Inscricao.create(contexto.usuario.id, contexto.evento.id, "outro-lote-2", new Date("2030-01-15T11:56:00Z")),
  );

  await esperarErro(contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  }), "LIMITE_CPF_EXCEDIDO");
});

test("reservas pendentes expiradas não consomem capacidade nem limite por CPF", async () => {
  const contexto = criarContexto();
  const reservaExpirada = Inscricao.create(
    contexto.usuario.id,
    contexto.evento.id,
    contexto.lote.id,
    new Date("2030-01-15T11:00:00Z"),
  );
  reservaExpirada.expirar(new Date("2030-01-15T11:10:00Z"));
  contexto.inscricoes.push(reservaExpirada);

  const resultado = await contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  });

  assert.equal(resultado.estado, "PENDENTE");
  assert.equal(contexto.inscricoes.length, 2);
});

test("HTTP cria reserva pendente e informa sua expiração", async (t) => {
  const contexto = criarContexto();
  const app = express();
  app.use(express.json());
  app.use(createInscricaoRoutes(new InscricaoControle(
    contexto.useCase,
    new CancelarInscricao(contexto.inscricaoRepositorio, contexto.promotorFilaEspera),
  )));

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
    `http://127.0.0.1:${address.port}/eventos/${contexto.evento.id}/lotes/${contexto.lote.id}/inscricoes`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usuario_id: contexto.usuario.id }),
    },
  );
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.estado, "PENDENTE");
  assert.equal(body.data.expira_em, "2030-01-15T12:10:00.000Z");
  assert.equal(contexto.inscricoes.length, 1);
});

test("HTTP retorna 400 para payload de reserva inválido", async (t) => {
  const contexto = criarContexto();
  const app = express();
  app.use(express.json());
  app.use(createInscricaoRoutes(new InscricaoControle(
    contexto.useCase,
    new CancelarInscricao(contexto.inscricaoRepositorio, contexto.promotorFilaEspera),
  )));

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
    `http://127.0.0.1:${address.port}/eventos/${contexto.evento.id}/lotes/${contexto.lote.id}/inscricoes`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usuario_id: " " }),
    },
  );

  assert.equal(response.status, 400);
});

test("HTTP adiciona à fila quando o lote está esgotado", async (t) => {
  const contexto = criarContexto();
  contexto.inscricoes.push(
    Inscricao.create("outro-usuario", contexto.evento.id, contexto.lote.id, new Date("2030-01-15T11:55:00Z")),
    Inscricao.create("outro-usuario-2", contexto.evento.id, contexto.lote.id, new Date("2030-01-15T11:56:00Z")),
  );
  const app = express();
  app.use(express.json());
  app.use(createInscricaoRoutes(new InscricaoControle(
    contexto.useCase,
    new CancelarInscricao(contexto.inscricaoRepositorio, contexto.promotorFilaEspera),
  )));

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
    `http://127.0.0.1:${address.port}/eventos/${contexto.evento.id}/lotes/${contexto.lote.id}/inscricoes`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usuario_id: contexto.usuario.id }),
    },
  );
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.tipo, "FILA_ESPERA");
  assert.equal(body.data.estado, "AGUARDANDO");
  assert.equal(contexto.entradasFila.length, 1);
});

test("HTTP cancela inscrição e libera a vaga", async (t) => {
  const contexto = criarContexto();
  const reserva = await contexto.useCase.execute({
    usuario_id: contexto.usuario.id,
    evento_id: contexto.evento.id,
    lote_id: contexto.lote.id,
  });
  const app = express();
  app.use(express.json());
  app.use(createInscricaoRoutes(new InscricaoControle(
    contexto.useCase,
    new CancelarInscricao(contexto.inscricaoRepositorio, contexto.promotorFilaEspera),
  )));

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
    `http://127.0.0.1:${address.port}/inscricoes/${reserva.id}`,
    { method: "DELETE" },
  );
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.data.estado, "CANCELADA");
  const inscricao = await contexto.inscricaoRepositorio.buscarPorId(reserva.id);
  assert.equal(inscricao?.ocupaVagaEm(agora), false);
});
