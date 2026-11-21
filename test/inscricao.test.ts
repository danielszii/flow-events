import assert from "node:assert/strict";
import { test } from "node:test";
import { EstadoInscricao, Inscricao } from "../src/dominio/entidades/Inscricao";
import { InscricaoInvalidaError } from "../src/dominio/erros/InscricaoInvalidaError";

const reservadoEm = new Date("2030-01-01T10:00:00.000Z");
const expiraEm = new Date("2030-01-01T10:10:00.000Z");

function criarInscricao(): Inscricao {
  return Inscricao.create("usuario-1", "evento-1", "lote-1", reservadoEm);
}

test("cria reserva pendente com expiração em dez minutos", () => {
  const inscricao = criarInscricao();

  assert.equal(inscricao.estado, EstadoInscricao.PENDENTE);
  assert.equal(inscricao.expira_em, expiraEm.toISOString());
  assert.equal(inscricao.confirmado_em, null);
});

test("valida IDs obrigatórios da inscrição", () => {
  assert.throws(
    () => Inscricao.create("", "evento-1", "lote-1", reservadoEm),
    InscricaoInvalidaError,
  );
  assert.throws(
    () => Inscricao.create("usuario-1", " ", "lote-1", reservadoEm),
    InscricaoInvalidaError,
  );
  assert.throws(
    () => Inscricao.create("usuario-1", "evento-1", "", reservadoEm),
    InscricaoInvalidaError,
  );
});

test("confirma pagamento antes da expiração e ocupa a vaga", () => {
  const inscricao = criarInscricao();
  const confirmadoEm = new Date("2030-01-01T10:09:59.999Z");

  inscricao.confirmarPagamento(confirmadoEm);

  assert.equal(inscricao.estado, EstadoInscricao.CONFIRMADA);
  assert.equal(inscricao.confirmado_em, confirmadoEm.toISOString());
  assert.equal(inscricao.ocupaVagaEm(expiraEm), true);
});

test("expira a reserva no instante limite e libera a vaga", () => {
  const inscricao = criarInscricao();

  inscricao.expirar(expiraEm);

  assert.equal(inscricao.estado, EstadoInscricao.EXPIRADA);
  assert.equal(inscricao.ocupaVagaEm(expiraEm), false);
});

test("não permite confirmar reserva após expiração", () => {
  const inscricao = criarInscricao();

  assert.throws(
    () => inscricao.confirmarPagamento(expiraEm),
    InscricaoInvalidaError,
  );
  assert.equal(inscricao.estado, EstadoInscricao.PENDENTE);
});

test("não permite confirmação anterior à reserva", () => {
  const inscricao = criarInscricao();

  assert.throws(
    () => inscricao.confirmarPagamento(new Date("2030-01-01T09:59:59.999Z")),
    InscricaoInvalidaError,
  );
  assert.equal(inscricao.estado, EstadoInscricao.PENDENTE);
});

test("só permite registrar presença de inscrição confirmada", () => {
  const inscricao = criarInscricao();

  assert.throws(() => inscricao.registrarPresenca(), InscricaoInvalidaError);

  inscricao.confirmarPagamento(new Date("2030-01-01T10:05:00.000Z"));
  inscricao.registrarPresenca();

  assert.equal(inscricao.estado, EstadoInscricao.ATENDIDA);
  assert.equal(inscricao.ocupaVagaEm(new Date("2030-01-01T10:11:00.000Z")), true);
});

test("cancelamento de inscrição confirmada libera a vaga", () => {
  const inscricao = criarInscricao();
  const cancelada = new Date("2030-01-01T10:05:00.000Z");

  inscricao.confirmarPagamento(cancelada);
  inscricao.cancelar();

  assert.equal(inscricao.estado, EstadoInscricao.CANCELADA);
  assert.equal(inscricao.ocupaVagaEm(cancelada), false);
});
