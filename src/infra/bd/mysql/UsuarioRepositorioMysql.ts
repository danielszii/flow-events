import { RowDataPacket } from "mysql2";
import { Usuario, UsuarioProps } from "../../../dominio/entidades/Usuario";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";
import { conexao } from "./MysqlConexao";

export class UsuarioRepositorioMysql implements UsuarioRepositorio {

  public async buscarPorId(id: string): Promise<Usuario | null> {
    try {
      const [[result]] = await conexao.query<UsuarioProps & RowDataPacket[]>("SELECT * FROM usuarios WHERE id=?", [id]);
      if (!result) {
        return null;
      }
      const { cpf, nome, email, criado_em } = result;
      return Usuario.fromPersistence({
        id,
        cpf,
        nome,
        email,
        criado_em: criado_em.toString(),
      });
    } catch (error) {
      throw error;
    }
  }

  async listar(): Promise<Usuario[]> {
    const [rows] = await conexao.query<UsuarioProps[] & RowDataPacket[]>("SELECT * FROM usuarios");
    if (Array.isArray(rows)) {
      return rows.map(row => {
        const { id, cpf, nome, email, criado_em } = row;
        return Usuario.fromPersistence({
          id,
          cpf,
          nome,
          email,
          criado_em: criado_em.toString(),
        });
      });
    }
    return [];
  }

  async salvar(usuario: Usuario): Promise<void> {
    try {
      const props = usuario.toPersistence();
      await conexao.query(
        "INSERT INTO usuarios (id, cpf, nome, email, criado_em) VALUES (?, ?, ?, ?, ?)",
        [props.id, props.cpf, props.nome, props.email, props.criado_em]
      );
    } catch (error) {
      console.log(error);
      throw Error("Erro ao salvar o usuário: " + usuario.nome);
    }
  }

  async deletar(id: string): Promise<void> {
    try {
      await conexao.query("DELETE FROM usuarios WHERE id = ?", [id]);
    } catch (error) {
      console.log(error);
      throw Error("Erro ao deletar o usuário: " + id);
    }
  }

  async atualizar(usuario: Usuario): Promise<void> {
    const props = usuario.toPersistence();
    await conexao.query(
      "UPDATE usuarios SET nome = ?, email = ? WHERE id = ?",
      [props.nome, props.email, props.id]
    );
  }
}