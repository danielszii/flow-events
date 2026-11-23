import { Inscricao } from "../entidades/Inscricao";

export interface InscricaoRepositorio {
  buscarPorId(id: string): Promise<Inscricao | null>;
  listarPorUsuario(usuario_id: string): Promise<Inscricao[]>;
  listarPorCpfEEvento(cpf: string, evento_id: string): Promise<Inscricao[]>;
  listarPorLote(lote_id: string): Promise<Inscricao[]>;
  listarPendentesExpiradas(ate: Date): Promise<Inscricao[]>;
  salvar(inscricao: Inscricao): Promise<void>;
  atualizar(inscricao: Inscricao): Promise<void>;
}
