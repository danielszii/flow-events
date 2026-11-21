import { RowDataPacket } from "mysql2";
import { Evento, EventoProps, EstadoEvento } from "../../../dominio/entidades/Evento";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { conexao } from "./MysqlConexao";

export class EventoRepositorioMysql implements EventoRepositorio {

  public async buscarPorId(id: string): Promise<Evento | null> {
    try {
      const [[result]] = await conexao.query<EventoProps & RowDataPacket[]>("SELECT * FROM eventos WHERE id=?", [id]);
      if (!result) {
        return null;
      }
      const { titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf, estado, criado_em } = result;

      const evento = Evento.fromPersistence({
        id,
        titulo,
        descricao,
        data_hora_inicio: data_hora_inicio.toString(),
        data_hora_fim: data_hora_fim.toString(),
        limite_ingressos_cpf,
        estado: estado as EstadoEvento,
        criado_em: criado_em.toString(),
      });
      return evento;
    } catch (error) {
      throw error;
    }
  }

  async listar(): Promise<Evento[]> {
    const [rows] = await conexao.query<EventoProps[] & RowDataPacket[]>("SELECT * FROM eventos");
    if (Array.isArray(rows)) {
      return rows.map(row => {
        const { id, titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf, estado, criado_em } = row;
        return Evento.fromPersistence({
          id,
          titulo,
          descricao,
          data_hora_inicio: data_hora_inicio.toString(),
          data_hora_fim: data_hora_fim.toString(),
          limite_ingressos_cpf,
          estado: estado as EstadoEvento,
          criado_em: criado_em.toString(),
        });
      });
    }
    return [];
  }

  async salvar(evento: Evento): Promise<void> {
    try {
      const props = evento.toPersistence();
      await conexao.query(
        "INSERT INTO eventos (id, titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf, estado, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [props.id, props.titulo, props.descricao, props.data_hora_inicio, props.data_hora_fim, props.limite_ingressos_cpf, props.estado, props.criado_em]
      );
    } catch (error) {
      console.log(error);
      throw Error("Erro ao salvar o evento: " + evento.titulo);
    }
  }

  async remover(id: string): Promise<boolean> {
    try {
      await conexao.query("DELETE FROM eventos WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.log(error);
      throw Error("Erro ao deletar o evento: " + id);
    }
  }

  async atualizar(evento: Evento): Promise<void> {
    const props = evento.toPersistence();
    await conexao.query(
      "UPDATE eventos SET titulo = ?, descricao = ?, data_hora_inicio = ?, data_hora_fim = ?, limite_ingressos_cpf = ?, estado = ? WHERE id = ?",
      [props.titulo, props.descricao, props.data_hora_inicio, props.data_hora_fim, props.limite_ingressos_cpf, props.estado, props.id]
    );
  }
}
