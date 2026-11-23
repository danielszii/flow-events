import {
  ExpirarInscricoesInputDTO,
  ExpirarInscricoesOutputDTO,
} from "../../dto/inscricao/ExpirarInscricoesDTO";
import { InscricaoRepositorio } from "../../../dominio/repositorios/InscricaoRepositorio";
import { UseCase } from "../UseCase";
import { PromotorFilaEspera } from "./PromoverFilaEspera";

export class ExpirarInscricoesPendentes
  implements UseCase<ExpirarInscricoesInputDTO, ExpirarInscricoesOutputDTO> {
  constructor(
    private readonly inscricaoRepositorio: InscricaoRepositorio,
    private readonly promotorFilaEspera: PromotorFilaEspera,
    private readonly obterAgora: () => Date = () => new Date(),
  ) { }

  public async execute(): Promise<ExpirarInscricoesOutputDTO> {
    const agora = this.obterAgora();
    if (Number.isNaN(agora.getTime())) {
      throw new Error("Relógio retornou uma data inválida");
    }

    const expiradas = await this.inscricaoRepositorio.listarPendentesExpiradas(agora);

    let quantidadePromovida = 0;
    for (const inscricao of expiradas) {
      inscricao.expirar(agora);
      await this.inscricaoRepositorio.atualizar(inscricao);
      const promovida = await this.promotorFilaEspera.execute({ lote_id: inscricao.lote_id });
      if (promovida) {
        quantidadePromovida += 1;
      }
    }

    return {
      quantidade_expirada: expiradas.length,
      quantidade_promovida: quantidadePromovida,
    };
  }
}
