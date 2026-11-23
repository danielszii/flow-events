import { FilaEspera } from "../../../dominio/entidades/FilaEspera";
import { FilaEsperaRepositorio } from "../../../dominio/repositorios/FilaEsperaRepositorio";

export class FilaEsperaRepositorioMemoria implements FilaEsperaRepositorio {
  private readonly entradas = new Map<string, FilaEspera>();

  public async buscarPorUsuarioELote(usuario_id: string, lote_id: string): Promise<FilaEspera | null> {
    return [...this.entradas.values()].find((entrada) => (
      entrada.usuario_id === usuario_id && entrada.lote_id === lote_id
    )) ?? null;
  }

  public async listarPorLoteEmOrdemDeEntrada(lote_id: string): Promise<FilaEspera[]> {
    return [...this.entradas.values()]
      .filter((entrada) => entrada.lote_id === lote_id)
      .sort((a, b) => Date.parse(a.criado_em) - Date.parse(b.criado_em));
  }

  public async salvar(entrada: FilaEspera): Promise<void> {
    if (this.entradas.has(entrada.id)) {
      throw new Error(`Entrada de fila ${entrada.id} já existe`);
    }

    this.entradas.set(entrada.id, entrada);
  }

  public async remover(id: string): Promise<void> {
    if (!this.entradas.delete(id)) {
      throw new Error(`Entrada de fila ${id} não encontrada`);
    }
  }
}
