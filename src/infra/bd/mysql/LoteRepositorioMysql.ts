import { RowDataPacket } from "mysql2";
import { Lote, LoteProps } from "../../../dominio/entidades/Lote";
import { LoteRepositorio } from "../../../dominio/repositorios/LoteRepositorio";
import { conexao } from "./MysqlConexao";

type LoteRow = Omit<
  LoteProps,
  "preco" | "data_hora_inicio_venda" | "data_hora_fim_venda" | "criado_em"
> & {
  preco: number | string;
  data_hora_inicio_venda: Date | string;
  data_hora_fim_venda: Date | string;
  criado_em: Date | string;
} & RowDataPacket;

export class LoteRepositorioMysql implements LoteRepositorio {
  public async buscarPorId(id: string): Promise<Lote | null> {
    const [rows] = await conexao.query<LoteRow[]>(
      `SELECT id, evento_id, nome, preco, quantidade_total,
              data_hora_inicio_venda, data_hora_fim_venda, criado_em
       FROM lotes
       WHERE id = ?
       LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? this.toEntity(row) : null;
  }

  public async listarPorEvento(evento_id: string): Promise<Lote[]> {
    const [rows] = await conexao.query<LoteRow[]>(
      `SELECT id, evento_id, nome, preco, quantidade_total,
              data_hora_inicio_venda, data_hora_fim_venda, criado_em
       FROM lotes
       WHERE evento_id = ?
       ORDER BY data_hora_inicio_venda, criado_em`,
      [evento_id],
    );

    return rows.map((row) => this.toEntity(row));
  }

  public async salvar(lote: Lote): Promise<void> {
    const props = lote.toPersistence();

    await conexao.query(
      `INSERT INTO lotes (
        id, evento_id, nome, preco, quantidade_total,
        data_hora_inicio_venda, data_hora_fim_venda, criado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        props.id,
        props.evento_id,
        props.nome,
        props.preco,
        props.quantidade_total,
        props.data_hora_inicio_venda,
        props.data_hora_fim_venda,
        props.criado_em,
      ],
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
