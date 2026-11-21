import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";
import { Lote } from "../../../dominio/entidades/Lote";
import { LoteRepositorio } from "../../../dominio/repositorios/LoteRepositorio";
import { EventoNaoEncontradoError } from "../../erros/EventoNaoEncontradoError";
import { ListLotesInputDTO, ListLotesOutputDTO } from "../../dto/lote/ListLotesDTO";
import { UseCase } from "../UseCase";

export class ListLotes implements UseCase<ListLotesInputDTO, ListLotesOutputDTO> {
  constructor(
    private readonly loteRepositorio: LoteRepositorio,
    private readonly eventoRepositorio: EventoRepositorio,
  ) { }

  public async execute(input: ListLotesInputDTO): Promise<ListLotesOutputDTO> {
    if (typeof input.evento_id !== "string" || !input.evento_id.trim()) {
      throw new Error("ID do evento é obrigatório");
    }

    const eventoId = input.evento_id.trim();
    const evento = await this.eventoRepositorio.buscarPorId(eventoId);

    if (!evento) {
      throw new EventoNaoEncontradoError(eventoId);
    }

    const lotes = await this.loteRepositorio.listarPorEvento(eventoId);

    return {
      lotes: this.presentOutput(lotes),
    };
  }

  private presentOutput(lotes: Lote[]): ListLotesOutputDTO["lotes"] {
    return lotes.map((lote) => ({
      id: lote.id,
      evento_id: lote.evento_id,
      nome: lote.nome,
      preco: lote.preco,
      quantidade_total: lote.quantidade_total,
      data_hora_inicio_venda: lote.data_hora_inicio_venda,
      data_hora_fim_venda: lote.data_hora_fim_venda,
      criado_em: lote.criado_em,
    }));
  }
}
