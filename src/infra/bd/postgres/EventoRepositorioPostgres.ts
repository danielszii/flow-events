import { Evento, EventoProps, EstadoEvento } from "../../../dominio/entidades/Evento";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { conexaoPostgres } from "./PostgresConexao";

export class EventoRepositorioPostgres implements EventoRepositorio {
  public async buscarPorId(id: string): Promise<Evento | null> {
    const result = await conexaoPostgres.query<EventoProps>(
      "SELECT id, titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf, estado, criado_em FROM eventos WHERE id = $1 LIMIT 1",
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return Evento.fromPersistence({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      data_hora_inicio: new Date(row.data_hora_inicio).toISOString(),
      data_hora_fim: new Date(row.data_hora_fim).toISOString(),
      limite_ingressos_cpf: row.limite_ingressos_cpf,
      estado: row.estado as EstadoEvento,
      criado_em: new Date(row.criado_em).toISOString(),
    });
  }

  public async listar(): Promise<Evento[]> {
    const result = await conexaoPostgres.query<EventoProps>(
      "SELECT id, titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf, estado, criado_em FROM eventos ORDER BY criado_em DESC"
    );

    return result.rows.map((row) =>
      Evento.fromPersistence({
        id: row.id,
        titulo: row.titulo,
        descricao: row.descricao,
        data_hora_inicio: new Date(row.data_hora_inicio).toISOString(),
        data_hora_fim: new Date(row.data_hora_fim).toISOString(),
        limite_ingressos_cpf: row.limite_ingressos_cpf,
        estado: row.estado as EstadoEvento,
        criado_em: new Date(row.criado_em).toISOString(),
      })
    );
  }

  public async salvar(evento: Evento): Promise<void> {
    try {
      const props = evento.toPersistence();
      await conexaoPostgres.query(
        `INSERT INTO eventos (
          id, titulo, descricao, data_hora_inicio, data_hora_fim,
          limite_ingressos_cpf, estado, criado_em
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          props.id,
          props.titulo,
          props.descricao,
          props.data_hora_inicio,
          props.data_hora_fim,
          props.limite_ingressos_cpf,
          props.estado,
          props.criado_em,
        ]
      );
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao salvar o evento: " + evento.titulo);
    }
  }

  public async remover(id: string): Promise<boolean> {
    try {
      const result = await conexaoPostgres.query(
        "DELETE FROM eventos WHERE id = $1",
        [id]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error(error);
      throw new Error("Erro ao deletar o evento: " + id);
    }
  }

  public async atualizar(evento: Evento): Promise<void> {
    const props = evento.toPersistence();
    await conexaoPostgres.query(
      `UPDATE eventos SET
        titulo = $1, descricao = $2, data_hora_inicio = $3,
        data_hora_fim = $4, limite_ingressos_cpf = $5, estado = $6
       WHERE id = $7`,
      [
        props.titulo,
        props.descricao,
        props.data_hora_inicio,
        props.data_hora_fim,
        props.limite_ingressos_cpf,
        props.estado,
        props.id,
      ]
    );
  }
}
