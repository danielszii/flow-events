import assert from "node:assert/strict";
import { test } from "node:test";
import { CancelarInscricao } from "../src/aplicacao/usecase/inscricao/CancelarInscricao";
import { InscricaoNaoEncontradaError } from "../src/aplicacao/erros/InscricaoNaoEncontradaError";
import { EstadoInscricao, Inscricao } from "../src/dominio/entidades/Inscricao";
import { InscricaoInvalidaError } from "../src/dominio/erros/InscricaoInvalidaError";
import { Usuario } from "../src/dominio/entidades/Usuario";
import { UsuarioRepositorio } from "../src/dominio/repositorios/UsuarioRepositorio";
import { InscricaoRepositorioMemoria } from "../src/infra/bd/memoria/InscricaoRepositorioMemoria";

function criarRepositorio(): InscricaoRepositorioMemoria {
  const usuario = Usuario.create("12345678901", "Ana", "ana@example.com");
  const usuarioRepositorio: UsuarioRepositorio = {
    buscarPorId: async () => usuario,
    listar: async () => [usuario],
    salvar: async () => {},
    deletar: async () => {},
    atualizar: async () => {},
  };
  return new InscricaoRepositorioMemoria(usuarioRepositorio);
}

const promotorFilaVazia = { execute: async () => null };

test("cancela uma inscrição confirmada e libera a vaga", async () => {
  const repositorio = criarRepositorio();
  const inscricao = Inscricao.create("usuario-1", "evento-1", "lote-1");
  inscricao.confirmarPagamento(
    new Date(new Date(inscricao.reservado_em).getTime() + 60_000),
  );
  await repositorio.salvar(inscricao);

  const resultado = await new CancelarInscricao(repositorio, promotorFilaVazia).execute({ id: inscricao.id });
  const atualizada = await repositorio.buscarPorId(inscricao.id);

  assert.equal(resultado.estado, EstadoInscricao.CANCELADA);
  assert.equal(atualizada?.ocupaVagaEm(), false);
});

test("retorna erro quando a inscrição não existe", async () => {
  const repositorio = criarRepositorio();

  await assert.rejects(
    () => new CancelarInscricao(repositorio, promotorFilaVazia).execute({ id: "inexistente" }),
    InscricaoNaoEncontradaError,
  );
});

test("não permite cancelar inscrição atendida", async () => {
  const repositorio = criarRepositorio();
  const inscricao = Inscricao.create("usuario-1", "evento-1", "lote-1");
  inscricao.confirmarPagamento(
    new Date(new Date(inscricao.reservado_em).getTime() + 60_000),
  );
  inscricao.registrarPresenca();
  await repositorio.salvar(inscricao);

  await assert.rejects(
    () => new CancelarInscricao(repositorio, promotorFilaVazia).execute({ id: inscricao.id }),
    InscricaoInvalidaError,
  );
  assert.equal(inscricao.estado, EstadoInscricao.ATENDIDA);
});
