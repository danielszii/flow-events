import { FilaEspera } from "../entidades/FilaEspera";

export interface FilaEsperaRepositorio {
  buscarPorUsuarioELote(usuario_id: string, lote_id: string): Promise<FilaEspera | null>;
  listarPorLoteEmOrdemDeEntrada(lote_id: string): Promise<FilaEspera[]>;
  salvar(entrada: FilaEspera): Promise<void>;
  remover(id: string): Promise<void>;
}
