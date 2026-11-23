import { InscricaoNaoEncontradaError } from "../../erros/InscricaoNaoEncontradaError";
import {
  ConfirmarInscricaoInputDTO,
  ConfirmarInscricaoOutputDTO,
} from "../../dto/inscricao/ConfirmarInscricaoDTO";
import { InscricaoRepositorio } from "../../../dominio/repositorios/InscricaoRepositorio";
import { UseCase } from "../UseCase";

export class ConfirmarInscricao implements UseCase<ConfirmarInscricaoInputDTO, ConfirmarInscricaoOutputDTO> {
  constructor(
    private readonly inscricaoRepositorio: InscricaoRepositorio,
    private readonly obterAgora: () => Date = () => new Date(),
  ) { }

  public async execute(input: ConfirmarInscricaoInputDTO): Promise<ConfirmarInscricaoOutputDTO> {
    if (typeof input.id !== "string" || !input.id.trim()) {
      throw new Error("ID da inscrição é obrigatório");
    }

    const inscricao = await this.inscricaoRepositorio.buscarPorId(input.id.trim());
    if (!inscricao) {
      throw new InscricaoNaoEncontradaError(input.id);
    }

    const confirmadoEm = this.obterAgora();
    inscricao.confirmarPagamento(confirmadoEm);
    await this.inscricaoRepositorio.atualizar(inscricao);

    return {
      id: inscricao.id,
      estado: inscricao.estado,
      confirmado_em: inscricao.confirmado_em,
    };
  }
}
