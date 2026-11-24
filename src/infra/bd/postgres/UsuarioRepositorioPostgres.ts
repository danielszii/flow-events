import { Usuario, UsuarioProps } from "../../../dominio/entidades/Usuario";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";
import { conexaoPostgres } from "./PostgresConexao";

export class UsuarioRepositorioPostgres implements UsuarioRepositorio {
  public async buscarPorId(id: string): Promise<Usuario | null> {
    const result = await conexaoPostgres.query<UsuarioProps>(
      "SELECT id, cpf, nome, email, criado_em FROM usuarios WHERE id = $1 LIMIT 1",
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return Usuario.fromPersistence({
      id: row.id,
      cpf: row.cpf,
      nome: row.nome,
      email: row.email,
      criado_em: new Date(row.criado_em).toISOString(),
    });
  }

  public async listar(): Promise<Usuario[]> {
    const result = await conexaoPostgres.query<UsuarioProps>(
      "SELECT id, cpf, nome, email, criado_em FROM usuarios ORDER BY criado_em DESC"
    );

    return result.rows.map((row) =>
      Usuario.fromPersistence({
        id: row.id,
        cpf: row.cpf,
        nome: row.nome,
        email: row.email,
        criado_em: new Date(row.criado_em).toISOString(),
      })
    );
  }

  public async salvar(usuario: Usuario): Promise<void> {
    try {
      const props = usuario.toPersistence();
      await conexaoPostgres.query(
        "INSERT INTO usuarios (id, cpf, nome, email, criado_em) VALUES ($1, $2, $3, $4, $5)",
        [props.id, props.cpf, props.nome, props.email, props.criado_em]
      );
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao salvar o usuário: " + usuario.nome);
    }
  }

  public async deletar(id: string): Promise<void> {
    try {
      await conexaoPostgres.query("DELETE FROM usuarios WHERE id = $1", [id]);
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao deletar o usuário: " + id);
    }
  }

  public async atualizar(usuario: Usuario): Promise<void> {
    const props = usuario.toPersistence();
    await conexaoPostgres.query(
      "UPDATE usuarios SET nome = $1, email = $2 WHERE id = $3",
      [props.nome, props.email, props.id]
    );
  }
}
