import { Usuario } from "../entidades/Usuario";

export interface UsuarioRepositorio {
  buscarPorId(id: string): Promise<Usuario | null>;
  listar(): Promise<Usuario[]>;
  salvar(usuario: Usuario): Promise<void>;
  deletar(id: string): Promise<void>;
  atualizar(usuario: Usuario): Promise<void>;
}