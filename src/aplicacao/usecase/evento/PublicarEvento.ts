import { EventoNaoEncontradoError } from "../../erros/EventoNaoEncontradoError";
import { PublicarEventoInputDTO, PublicarEventoOutputDTO } from "../../dto/evento/PublicarEventoDTO";
import { UseCase } from "../UseCase";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";

export class PublicarEvento implements UseCase<PublicarEventoInputDTO, PublicarEventoOutputDTO> {
  constructor(private readonly eventoRepositorio: EventoRepositorio) {}

  public async execute(input: PublicarEventoInputDTO): Promise<PublicarEventoOutputDTO> {
    if (typeof input.id !== "string" || !input.id.trim()) {
      throw new Error("ID do evento é obrigatório");
    }

    const evento = await this.eventoRepositorio.buscarPorId(input.id);
    if (!evento) {
      throw new EventoNaoEncontradoError(input.id);
    }

    evento.publicar();
    await this.eventoRepositorio.atualizar(evento);

    return {
      id: evento.id,
      estado: evento.estado,
    };
  }
}
