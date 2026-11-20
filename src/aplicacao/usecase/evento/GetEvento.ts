import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { GetEventoInputDTO, GetEventoOutputDTO } from "../../dto/evento/GetEventoDTO";
import { UseCase } from "../UseCase";

export class GetEvento implements UseCase<GetEventoInputDTO, GetEventoOutputDTO> {
  constructor(private readonly eventoRepositorio: EventoRepositorio) { }

  public async execute(inputDto: GetEventoInputDTO): Promise<GetEventoOutputDTO> {

    const evento = await this.eventoRepositorio.buscarPorId(inputDto.id);

    if (!evento) {
      return null;
    }

    return {
      id: evento.id,
      titulo: evento.titulo,
      descricao: evento.descricao,
      data_hora_inicio: evento.data_hora_inicio,
      data_hora_fim: evento.data_hora_fim,
      limite_ingressos_cpf: evento.limite_ingressos_cpf,
      estado: evento.estado,
      criado_em: evento.criado_em,
    };
  }
}