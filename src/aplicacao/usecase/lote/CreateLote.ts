import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { Lote } from "../../../dominio/entidades/Lote";
import { LoteRepositorio } from "../../../dominio/repositorios/LoteRepositorio";
import { EventoNaoEncontradoError } from "../../erros/EventoNaoEncontradoError";
import { CreateLoteInputDTO, CreateLoteOutputDTO } from "../../dto/lote/CreateLoteDTO";
import { UseCase } from "../UseCase";

export class CreateLote implements UseCase<CreateLoteInputDTO, CreateLoteOutputDTO> {
  constructor(
    private readonly loteRepositorio: LoteRepositorio,
    private readonly eventoRepositorio: EventoRepositorio,
  ) { }

  public async execute(input: CreateLoteInputDTO): Promise<CreateLoteOutputDTO> {
    if (typeof input.evento_id !== "string" || !input.evento_id.trim()) {
      throw new Error("ID do evento é obrigatório");
    }

    const eventoId = input.evento_id.trim();
    const evento = await this.eventoRepositorio.buscarPorId(eventoId);

    if (!evento) {
      throw new EventoNaoEncontradoError(eventoId);
    }

    const lote = Lote.create(
      eventoId,
      input.nome,
      input.preco,
      input.quantidade_total,
      input.data_hora_inicio_venda,
      input.data_hora_fim_venda,
    );

    await this.loteRepositorio.salvar(lote);

    return { id: lote.id };
  }
}
