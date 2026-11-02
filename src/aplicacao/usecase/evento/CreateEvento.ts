import { Evento } from "../../../dominio/entidades/Evento";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { CreateEventoInputDTO } from "../../dto/evento/CreateEventoInputDTO";
import { CreateEventoOutputDTO } from "../../dto/evento/CreateEventoOutputDTO";
import { UseCase } from "../UseCase";

export class CreateEvento implements UseCase<CreateEventoInputDTO, CreateEventoOutputDTO> {
    constructor(private readonly eventoRepositorio: EventoRepositorio) { }

    public async execute(inputDto: CreateEventoInputDTO): Promise<CreateEventoOutputDTO> {

        const evento = Evento.create(inputDto.nome, inputDto.descricao, inputDto.dataInicio, inputDto.dataFim, inputDto.local, inputDto.imagemUrl, inputDto.tipo, inputDto.categoria, inputDto.valor, inputDto.idadeMinima, inputDto.status, inputDto.criadoPor, inputDto.atualizadoPor);
        await this.eventoRepositorio.salvar(evento)
    }
}