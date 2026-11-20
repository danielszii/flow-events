import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { UpdateEventoInputDTO, UpdateEventoOutputDTO } from "../../dto/evento/UpdateEventoDTO";
import { UseCase } from "../UseCase";

export class UpdateEvento implements UseCase<UpdateEventoInputDTO, UpdateEventoOutputDTO> {
  constructor(private readonly eventoRepositorio: EventoRepositorio) { }

  public async execute(inputDto: UpdateEventoInputDTO): Promise<UpdateEventoOutputDTO> {

    try {
      const evento = await this.eventoRepositorio.buscarPorId(inputDto.id);

      if (!evento) {
        throw new Error(`Evento com ID ${inputDto.id} não encontrado`);
      }

      if (inputDto.titulo !== undefined) {
        evento.alterarTitulo(inputDto.titulo);
      }
      if (inputDto.descricao !== undefined) {
        evento.alterarDescricao(inputDto.descricao);
      }
      if (inputDto.data_hora_inicio !== undefined && inputDto.data_hora_fim !== undefined) {
        evento.alterarDatas(inputDto.data_hora_inicio, inputDto.data_hora_fim);
      }
      if (inputDto.limite_ingressos_cpf !== undefined) {
        evento.alterarLimiteIngressos(inputDto.limite_ingressos_cpf);
      }

      await this.eventoRepositorio.atualizar(evento);

      return {
        success: true,
        message: `Evento com ID ${inputDto.id} atualizado com sucesso`,
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar evento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }
}