import assert from "node:assert/strict";
import { test } from "node:test";
import { ConfirmarInscricao } from "../src/aplicacao/usecase/inscricao/ConfirmarInscricao";
import { ExpirarInscricoesPendentes } from "../src/aplicacao/usecase/inscricao/ExpirarInscricoesPendentes";
import { InscricaoNaoEncontradaError } from "../src/aplicacao/erros/InscricaoNaoEncontradaError";
import { EstadoInscricao, Inscricao } from "../src/dominio/entidades/Inscricao";
import { Usuario } from "../src/dominio/entidades/Usuario";
import { InscricaoRepositorioMemoria } from "../src/infra/bd/memoria/InscricaoRepositorioMemoria";
import { UsuarioRepositorio } from "../src/dominio/repositorios/UsuarioRepositorio";

const agora = new Date("2030-01-01T10:10:00.000Z");
const promotorFilaVazia = { execute: async () => null };

function criarRepositorioMemoria(): InscricaoRepositorioMemoria {
  const usuario = Usuario.create("12345678901", "Ana", "ana@example.com");
  const usuarios: UsuarioRepositorio = {
    buscarPorId: async () => usuario,
    listar: async () => [usuario],
    salvar: async () => {},
    deletar: async () => {},
    atualizar: async () => {},
  };
  return new InscricaoRepositorioMemoria(usuarios);
}

test("confirma uma inscrição pendente antes do vencimento", async () => {
  const repositorio = criarRepositorioMemoria();
  const inscricao = Inscricao.create(
    "usuario-1",
    "evento-1",
    "lote-1",
    new Date("2030-01-01T10:00:00.000Z"),
  );
  await repositorio.salvar(inscricao);

  const resultado = await new ConfirmarInscricao(repositorio, () => (
    new Date("2030-01-01T10:05:00.000Z")
  )).execute({ id: inscricao.id });

  assert.equal(resultado.estado, EstadoInscricao.CONFIRMADA);
  assert.equal(resultado.confirmado_em, "2030-01-01T10:05:00.000Z");
  assert.equal((await repositorio.buscarPorId(inscricao.id))?.estado, EstadoInscricao.CONFIRMADA);
});

test("não confirma uma inscrição inexistente", async () => {
  const repositorio = criarRepositorioMemoria();

  await assert.rejects(
    () => new ConfirmarInscricao(repositorio, () => agora).execute({ id: "inexistente" }),
    InscricaoNaoEncontradaError,
  );
});

test("expira apenas reservas pendentes vencidas", async () => {
  const repositorio = criarRepositorioMemoria();
  const vencida = Inscricao.create(
    "usuario-1",
    "evento-1",
    "lote-1",
    new Date("2030-01-01T10:00:00.000Z"),
  );
  const vigente = Inscricao.create(
    "usuario-2",
    "evento-1",
    "lote-1",
    new Date("2030-01-01T10:05:00.000Z"),
  );
  await repositorio.salvar(vencida);
  await repositorio.salvar(vigente);

  const resultado = await new ExpirarInscricoesPendentes(
    repositorio,
    promotorFilaVazia,
    () => agora,
  ).execute();

  assert.equal(resultado.quantidade_expirada, 1);
  assert.equal(resultado.quantidade_promovida, 0);
  assert.equal((await repositorio.buscarPorId(vencida.id))?.estado, EstadoInscricao.EXPIRADA);
  assert.equal((await repositorio.buscarPorId(vigente.id))?.estado, EstadoInscricao.PENDENTE);
});

test("não expira inscrições confirmadas", async () => {
  const repositorio = criarRepositorioMemoria();
  const confirmada = Inscricao.create(
    "usuario-1",
    "evento-1",
    "lote-1",
    new Date("2030-01-01T10:00:00.000Z"),
  );
  confirmada.confirmarPagamento(new Date("2030-01-01T10:05:00.000Z"));
  await repositorio.salvar(confirmada);

  const resultado = await new ExpirarInscricoesPendentes(
    repositorio,
    promotorFilaVazia,
    () => agora,
  ).execute();

  assert.equal(resultado.quantidade_expirada, 0);
  assert.equal((await repositorio.buscarPorId(confirmada.id))?.estado, EstadoInscricao.CONFIRMADA);
});
