import { EstadoInscricao, Inscricao, InscricaoProps } from "../../../dominio/entidades/Inscricao";
import { InscricaoRepositorio } from "../../../dominio/repositorios/InscricaoRepositorio";
import { conexaoPostgres } from "./PostgresConexao";

type InscricaoRow = {
  id: string;
  usuario_id: string;
  evento_id: string;
  lote_id: string;
  estado: string;
  reservado_em: Date | string;
  expira_em: Date | string;
  confirmado_em: Date | string | null;
  criado_em: Date | string;
};

export class InscricaoRepositorioPostgres implements InscricaoRepositorio {
  public async buscarPorId(id: string): Promise<Inscricao | null> {
    const result = await conexaoPostgres.query<InscricaoRow>(
      `SELECT id, usuario_id, evento_id, lote_id, estado,
              reservado_em, expira_em, confirmado_em, criado_em
       FROM inscricoes
       WHERE id = $1
       LIMIT 1`,
      [id]
    );

    const row = result.rows[0];
    return row ? this.toEntity(row) : null;
  }

  public async listarPorUsuario(usuario_id: string): Promise<Inscricao[]> {
    const result = await conexaoPostgres.query<InscricaoRow>(
      `SELECT id, usuario_id, evento_id, lote_id, estado,
              reservado_em, expira_em, confirmado_em, criado_em
       FROM inscricoes
       WHERE usuario_id = $1
       ORDER BY criado_em DESC`,
      [usuario_id]
    );

    return result.rows.map((row) => this.toEntity(row));
  }

  public async listarPorCpfEEvento(cpf: string, evento_id: string): Promise<Inscricao[]> {
    const result = await conexaoPostgres.query<InscricaoRow>(
      `SELECT i.id, i.usuario_id, i.evento_id, i.lote_id, i.estado,
              i.reservado_em, i.expira_em, i.confirmado_em, i.criado_em
       FROM inscricoes i
       INNER JOIN usuarios u ON u.id = i.usuario_id
       WHERE u.cpf = $1 AND i.evento_id = $2`,
      [cpf, evento_id]
    );

    return result.rows.map((row) => this.toEntity(row));
  }

  public async listarPorLote(lote_id: string): Promise<Inscricao[]> {
    const result = await conexaoPostgres.query<InscricaoRow>(
      `SELECT id, usuario_id, evento_id, lote_id, estado,
              reservado_em, expira_em, confirmado_em, criado_em
       FROM inscricoes
       WHERE lote_id = $1`,
      [lote_id]
    );

    return result.rows.map((row) => this.toEntity(row));
  }

  public async listarPendentesExpiradas(ate: Date): Promise<Inscricao[]> {
    const result = await conexaoPostgres.query<InscricaoRow>(
      `SELECT id, usuario_id, evento_id, lote_id, estado,
              reservado_em, expira_em, confirmado_em, criado_em
       FROM inscricoes
       WHERE estado = $1 AND expira_em <= $2`,
      [EstadoInscricao.PENDENTE, ate.toISOString()]
    );

    return result.rows.map((row) => this.toEntity(row));
  }

  public async salvar(inscricao: Inscricao): Promise<void> {
    const props = inscricao.toPersistence();

    await conexaoPostgres.query(
      `INSERT INTO inscricoes (
        id, usuario_id, evento_id, lote_id, estado,
        reservado_em, expira_em, confirmado_em, criado_em
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        props.id,
        props.usuario_id,
        props.evento_id,
        props.lote_id,
        props.estado,
        props.reservado_em,
        props.expira_em,
        props.confirmado_em,
        props.criado_em,
      ]
    );
  }

  public async atualizar(inscricao: Inscricao): Promise<void> {
    const props = inscricao.toPersistence();

    await conexaoPostgres.query(
      `UPDATE inscricoes SET
        estado = $1, confirmado_em = $2
       WHERE id = $3`,
      [props.estado, props.confirmado_em, props.id]
    );
  }

  private toEntity(row: InscricaoRow): Inscricao {
    return Inscricao.fromPersistence({
      id: row.id,
      usuario_id: row.usuario_id,
      evento_id: row.evento_id,
      lote_id: row.lote_id,
      estado: row.estado as EstadoInscricao,
      reservado_em: new Date(row.reservado_em).toISOString(),
      expira_em: new Date(row.expira_em).toISOString(),
      confirmado_em: row.confirmado_em ? new Date(row.confirmado_em).toISOString() : null,
      criado_em: new Date(row.criado_em).toISOString(),
    });
  }
}
