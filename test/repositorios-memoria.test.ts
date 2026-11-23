import assert from "node:assert/strict";
import { test } from "node:test";
import { Evento } from "../src/dominio/entidades/Evento";
import { Lote } from "../src/dominio/entidades/Lote";
import { Usuario } from "../src/dominio/entidades/Usuario";
import { EventoRepositorioMemoria } from "../src/infra/bd/memoria/EventoRepositorioMemoria";
import { LoteRepositorioMemoria } from "../src/infra/bd/memoria/LoteRepositorioMemoria";
import { UsuarioRepositorioMemoria } from "../src/infra/bd/memoria/UsuarioRepositorioMemoria";

test("repositório em memória de usuários persiste atualização e remoção", async () => {
  const repositorio = new UsuarioRepositorioMemoria();
  const usuario = Usuario.create("12345678901", "Ana", "ana@example.com");
  await repositorio.salvar(usuario);

  const usuarioCarregado = await repositorio.buscarPorId(usuario.id);
  assert.ok(usuarioCarregado);
  usuarioCarregado.alterarNome("Ana Silva");

  assert.equal((await repositorio.buscarPorId(usuario.id))?.nome, "Ana");
  await repositorio.atualizar(usuarioCarregado);
  assert.equal((await repositorio.buscarPorId(usuario.id))?.nome, "Ana Silva");
  assert.equal((await repositorio.listar()).length, 1);

  await repositorio.deletar(usuario.id);
  assert.equal(await repositorio.buscarPorId(usuario.id), null);
});

test("repositório em memória de eventos persiste publicação e remoção", async () => {
  const repositorio = new EventoRepositorioMemoria();
  const evento = Evento.create(
    "Evento",
    "Descrição",
    "2030-01-01T00:00:00.000Z",
    "2030-12-31T23:59:59.000Z",
    2,
  );
  await repositorio.salvar(evento);

  const eventoCarregado = await repositorio.buscarPorId(evento.id);
  assert.ok(eventoCarregado);
  eventoCarregado.publicar();

  assert.equal((await repositorio.buscarPorId(evento.id))?.estado, "RASCUNHO");
  await repositorio.atualizar(eventoCarregado);
  assert.equal((await repositorio.buscarPorId(evento.id))?.estado, "PUBLICADO");

  assert.equal(await repositorio.remover(evento.id), true);
  assert.equal(await repositorio.remover(evento.id), false);
});

test("repositório em memória de lotes filtra e ordena por abertura de vendas", async () => {
  const repositorio = new LoteRepositorioMemoria();
  const maisTarde = Lote.create(
    "evento-1",
    "Mais tarde",
    20,
    10,
    "2030-02-01T00:00:00.000Z",
    "2030-03-01T00:00:00.000Z",
  );
  const maisCedo = Lote.create(
    "evento-1",
    "Mais cedo",
    10,
    10,
    "2030-01-01T00:00:00.000Z",
    "2030-02-01T00:00:00.000Z",
  );
  const outroEvento = Lote.create(
    "evento-2",
    "Outro evento",
    10,
    10,
    "2030-01-01T00:00:00.000Z",
    "2030-02-01T00:00:00.000Z",
  );
  await repositorio.salvar(maisTarde);
  await repositorio.salvar(outroEvento);
  await repositorio.salvar(maisCedo);

  const lotes = await repositorio.listarPorEvento("evento-1");
  assert.deepEqual(lotes.map((lote) => lote.id), [maisCedo.id, maisTarde.id]);
  assert.equal(await repositorio.buscarPorId(outroEvento.id) !== null, true);
});
