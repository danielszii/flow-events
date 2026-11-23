import { Usuario, UsuarioProps } from "../../../dominio/entidades/Usuario";
import { UsuarioRepositorio } from "../../../dominio/repositorios/UsuarioRepositorio";

export class UsuarioRepositorioMemoria implements UsuarioRepositorio {
  private readonly usuarios = new Map<string, UsuarioProps>();

  public async buscarPorId(id: string): Promise<Usuario | null> {
    const usuario = this.usuarios.get(id);
    return usuario ? Usuario.fromPersistence({ ...usuario }) : null;
  }

  public async listar(): Promise<Usuario[]> {
    return [...this.usuarios.values()]
      .map((usuario) => Usuario.fromPersistence({ ...usuario }));
  }

  public async salvar(usuario: Usuario): Promise<void> {
    if (this.usuarios.has(usuario.id)) {
      throw new Error(`Usuário com ID ${usuario.id} já existe`);
    }

    this.usuarios.set(usuario.id, usuario.toPersistence());
  }

  public async deletar(id: string): Promise<void> {
    this.usuarios.delete(id);
  }

  public async atualizar(usuario: Usuario): Promise<void> {
    const existente = this.usuarios.get(usuario.id);
    if (!existente) {
      return;
    }

    const atualizado = usuario.toPersistence();
    this.usuarios.set(usuario.id, {
      ...existente,
      nome: atualizado.nome,
      email: atualizado.email,
    });
  }
}
