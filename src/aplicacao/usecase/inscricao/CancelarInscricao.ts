import { InscricaoRepositorio } from "../../../dominio/repositorios/InscricaoRepositorio";
import { InscricaoNaoEncontradaError } from "../../erros/InscricaoNaoEncontradaError";
import {
  CancelarInscricaoInputDTO,
  CancelarInscricaoOutputDTO,
} from "../../dto/inscricao/CancelarInscricaoDTO";
import { UseCase } from "../UseCase";
import { PromotorFilaEspera } from "./PromoverFilaEspera";

export class CancelarInscricao implements UseCase<CancelarInscricaoInputDTO, CancelarInscricaoOutputDTO> {
  constructor(
    private readonly inscricaoRepositorio: InscricaoRepositorio,
    private readonly promotorFilaEspera: PromotorFilaEspera,
    private readonly obterAgora: () => Date = () => new Date(),
  ) {}

  public async execute(input: CancelarInscricaoInputDTO): Promise<CancelarInscricaoOutputDTO> {
    if (typeof input.id !== "string" || !input.id.trim()) {
      throw new Error("ID da inscrição é obrigatório");
    }

    const inscricao = await this.inscricaoRepositorio.buscarPorId(input.id.trim());
    if (!inscricao) {
      throw new InscricaoNaoEncontradaError(input.id);
    }

    const agora = this.obterAgora();
    if (Number.isNaN(agora.getTime())) {
      throw new Error("Relógio retornou uma data inválida");
    }
    const liberouVaga = inscricao.ocupaVagaEm(agora);

    inscricao.cancelar();
    await this.inscricaoRepositorio.atualizar(inscricao);
    const promovida = liberouVaga
      ? await this.promotorFilaEspera.execute({ lote_id: inscricao.lote_id })
      : null;

    return {
      id: inscricao.id,
      estado: inscricao.estado,
      inscricao_promovida_id: promovida?.id ?? null,
    };
  }
}
