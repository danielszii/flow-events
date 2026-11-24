import { describe, it, after } from "node:test";
import assert from "node:assert";
import { conexaoPostgres } from "../src/infra/bd/postgres/PostgresConexao";
import { UsuarioRepositorioPostgres } from "../src/infra/bd/postgres/UsuarioRepositorioPostgres";
import { Usuario } from "../src/dominio/entidades/Usuario";

describe("Integração PostgreSQL", () => {
  after(async () => {
    await conexaoPostgres.end();
  });

  it("conecta no PostgreSQL e executa query simples", async () => {
    const res = await conexaoPostgres.query("SELECT current_database() as db");
    assert.strictEqual(res.rows[0].db, "flow_events");
  });

  it("persiste e busca um usuário no PostgreSQL", async () => {
    const repo = new UsuarioRepositorioPostgres();
    const usuario = Usuario.create("99988877766", "Teste Postgres", "teste@postgres.com");

    await repo.salvar(usuario);
    const encontrado = await repo.buscarPorId(usuario.id);

    assert.ok(encontrado);
    assert.strictEqual(encontrado?.nome, "Teste Postgres");
    assert.strictEqual(encontrado?.cpf, "99988877766");

    await repo.deletar(usuario.id);
  });
});
