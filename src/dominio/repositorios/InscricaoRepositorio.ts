import { Inscricao } from "../entidades/Inscricao";

export interface InscricaoRepositorio {
  buscarPorId(id: string): Promise<Inscricao | null>;
  listarPorUsuario(usuario_id: string): Promise<Inscricao[]>;
  salvar(inscricao: Inscricao): Promise<void>;
  atualizar(inscricao: Inscricao): Promise<void>;
}
