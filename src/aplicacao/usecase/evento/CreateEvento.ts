import { Evento } from "../../../dominio/entidades/Evento";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { CreateEventoInputDTO } from "../../dto/evento/CreateEventoInputDTO";
import { CreateEventoOutputDTO } from "../../dto/evento/CreateEventoOutputDTO";
import { UseCase } from "../UseCase";

export class CreateEvento implements UseCase<CreateEventoInputDTO, CreateEventoOutputDTO> {
  constructor(private readonly eventoRepositorio: EventoRepositorio) { }

  public async execute(inputDto: CreateEventoInputDTO): Promise<CreateEventoOutputDTO> {

    const evento = Evento.create(
      inputDto.titulo,
      inputDto.descricao,
      inputDto.data_hora_inicio,
      inputDto.data_hora_fim,
      inputDto.limite_ingressos_cpf,
    );
    await this.eventoRepositorio.salvar(evento);

    const outputDTO: CreateEventoOutputDTO = { id: evento.id };

    return outputDTO;
  }
}