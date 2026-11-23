import { Lote, LoteProps } from "../../../dominio/entidades/Lote";
import { LoteRepositorio } from "../../../dominio/repositorios/LoteRepositorio";

export class LoteRepositorioMemoria implements LoteRepositorio {
  private readonly lotes = new Map<string, LoteProps>();

  public async buscarPorId(id: string): Promise<Lote | null> {
    const lote = this.lotes.get(id);
    return lote ? Lote.fromPersistence({ ...lote }) : null;
  }

  public async listarPorEvento(evento_id: string): Promise<Lote[]> {
    return [...this.lotes.values()]
      .filter((lote) => lote.evento_id === evento_id)
      .sort((a, b) => (
        a.data_hora_inicio_venda.localeCompare(b.data_hora_inicio_venda)
        || a.criado_em.localeCompare(b.criado_em)
      ))
      .map((lote) => Lote.fromPersistence({ ...lote }));
  }

  public async salvar(lote: Lote): Promise<void> {
    if (this.lotes.has(lote.id)) {
      throw new Error(`Lote com ID ${lote.id} já existe`);
    }

    this.lotes.set(lote.id, lote.toPersistence());
  }
}
