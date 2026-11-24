import { FilaEspera, FilaEsperaProps } from "../../../dominio/entidades/FilaEspera";
import { FilaEsperaRepositorio } from "../../../dominio/repositorios/FilaEsperaRepositorio";
import { conexaoPostgres } from "./PostgresConexao";

type FilaEsperaRow = {
  id: string;
  usuario_id: string;
  evento_id: string;
  lote_id: string;
  estado: string;
  criado_em: Date | string;
};

export class FilaEsperaRepositorioPostgres implements FilaEsperaRepositorio {
  public async buscarPorUsuarioELote(usuario_id: string, lote_id: string): Promise<FilaEspera | null> {
    const result = await conexaoPostgres.query<FilaEsperaRow>(
      `SELECT id, usuario_id, evento_id, lote_id, estado, criado_em
       FROM fila_espera
       WHERE usuario_id = $1 AND lote_id = $2
       LIMIT 1`,
      [usuario_id, lote_id]
    );

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  public async listarPorLoteEmOrdemDeEntrada(lote_id: string): Promise<FilaEspera[]> {
    const result = await conexaoPostgres.query<FilaEsperaRow>(
      `SELECT id, usuario_id, evento_id, lote_id, estado, criado_em
       FROM fila_espera
       WHERE lote_id = $1
       ORDER BY criado_em ASC`,
      [lote_id]
    );

    return result.rows.map((row) => this.toEntity(row));
  }

  public async salvar(entrada: FilaEspera): Promise<void> {
    const props = entrada.toPersistence();

    await conexaoPostgres.query(
      `INSERT INTO fila_espera (
        id, usuario_id, evento_id, lote_id, estado, criado_em
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        props.id,
        props.usuario_id,
        props.evento_id,
        props.lote_id,
        "AGUARDANDO",
        props.criado_em,
      ]
    );
  }

  public async remover(id: string): Promise<void> {
    const result = await conexaoPostgres.query(
      "DELETE FROM fila_espera WHERE id = $1",
      [id]
    );

    if ((result.rowCount ?? 0) === 0) {
      throw new Error(`Entrada de fila ${id} não encontrada`);
    }
  }

  private toEntity(row: FilaEsperaRow): FilaEspera {
    return FilaEspera.fromPersistence({
      id: row.id,
      usuario_id: row.usuario_id,
      evento_id: row.evento_id,
      lote_id: row.lote_id,
      criado_em: new Date(row.criado_em).toISOString(),
    });
  }
}
