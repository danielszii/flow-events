import { Lote } from "../entidades/Lote";

export interface LoteRepositorio {
  buscarPorId(id: string): Promise<Lote | null>;
  listarPorEvento(evento_id: string): Promise<Lote[]>;
  salvar(lote: Lote): Promise<void>;
}
