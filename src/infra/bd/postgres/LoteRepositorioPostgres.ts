import { Lote, LoteProps } from "../../../dominio/entidades/Lote";
import { LoteRepositorio } from "../../../dominio/repositorios/LoteRepositorio";
import { conexaoPostgres } from "./PostgresConexao";

type LoteRow = {
  id: string;
  evento_id: string;
  nome: string;
  preco: number | string;
  quantidade_total: number;
  data_hora_inicio_venda: Date | string;
  data_hora_fim_venda: Date | string;
  criado_em: Date | string;
};

export class LoteRepositorioPostgres implements LoteRepositorio {
  public async buscarPorId(id: string): Promise<Lote | null> {
    const result = await conexaoPostgres.query<LoteRow>(
      `SELECT id, evento_id, nome, preco, quantidade_total,
              data_hora_inicio_venda, data_hora_fim_venda, criado_em
       FROM lotes
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  public async listarPorEvento(evento_id: string): Promise<Lote[]> {
    const result = await conexaoPostgres.query<LoteRow>(
      `SELECT id, evento_id, nome, preco, quantidade_total,
              data_hora_inicio_venda, data_hora_fim_venda, criado_em
       FROM lotes
       WHERE evento_id = $1
       ORDER BY data_hora_inicio_venda, criado_em`,
      [evento_id]
    );

    return result.rows.map((row) => this.toEntity(row));
  }

  public async salvar(lote: Lote): Promise<void> {
    const props = lote.toPersistence();

    await conexaoPostgres.query(
      `INSERT INTO lotes (
        id, evento_id, nome, preco, quantidade_total,
        data_hora_inicio_venda, data_hora_fim_venda, criado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        props.id,
        props.evento_id,
        props.nome,
        props.preco,
        props.quantidade_total,
        props.data_hora_inicio_venda,
        props.data_hora_fim_venda,
        props.criado_em,
      ]
    );
  }

  private toEntity(row: LoteRow): Lote {
    const preco = typeof row.preco === "number" ? row.preco : Number(row.preco);

    if (!Number.isFinite(preco)) {
      throw new Error(`Preço inválido para o lote ${row.id}`);
    }

    return Lote.fromPersistence({
      id: row.id,
      evento_id: row.evento_id,
      nome: row.nome,
      preco,
      quantidade_total: row.quantidade_total,
      data_hora_inicio_venda: this.toIsoString(row.data_hora_inicio_venda),
      data_hora_fim_venda: this.toIsoString(row.data_hora_fim_venda),
      criado_em: this.toIsoString(row.criado_em),
    });
  }

  private toIsoString(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Data inválida ao carregar lote do banco");
    }

    return date.toISOString();
  }
}
