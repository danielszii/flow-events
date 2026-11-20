import { Evento } from "../../../dominio/entidades/Evento";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { ListEventoInputDTO, ListEventoOutputDTO } from "../../dto/evento/ListEventoDTO";
import { UseCase } from "../UseCase";

export class ListEvento implements UseCase<ListEventoInputDTO, ListEventoOutputDTO> {
  constructor(private readonly eventoRepositorio: EventoRepositorio) { }

  public async execute(inputDto: ListEventoInputDTO): Promise<ListEventoOutputDTO> {

    const eventos = await this.eventoRepositorio.listar();

    const outputDTO: ListEventoOutputDTO = this.presentOutput(eventos);

    return outputDTO;
  }

  private presentOutput(eventos: Evento[]): ListEventoOutputDTO {
    return {
      eventos: eventos.map((evento) => {
        return {
          id: evento.id,
          titulo: evento.titulo,
          descricao: evento.descricao,
          data_hora_inicio: evento.data_hora_inicio,
          data_hora_fim: evento.data_hora_fim,
          estado: evento.estado,
        };
      }),
    };
  }
}