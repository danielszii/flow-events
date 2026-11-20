import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { DeleteEventoInputDTO, DeleteEventoOutputDTO } from "../../dto/evento/DeleteEventoDTO";
import { UseCase } from "../UseCase";

export class DeleteEvento implements UseCase<DeleteEventoInputDTO, DeleteEventoOutputDTO> {
  constructor(private readonly eventoRepositorio: EventoRepositorio) { }

  public async execute(inputDto: DeleteEventoInputDTO): Promise<DeleteEventoOutputDTO> {

    try {
      await this.eventoRepositorio.remover(inputDto.id);

      const outputDTO: DeleteEventoOutputDTO = this.presentOutput(inputDto.id);

      return outputDTO;
    } catch (error) {
      throw new Error(`Erro ao deletar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private presentOutput(id: string): DeleteEventoOutputDTO {
    return {
      success: true,
      message: `Evento com ID ${id} deletado com sucesso`,
    };
  }
}