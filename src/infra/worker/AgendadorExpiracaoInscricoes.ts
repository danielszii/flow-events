import { ExpirarInscricoesPendentes } from "../../aplicacao/usecase/inscricao/ExpirarInscricoesPendentes";

const INTERVALO_EXPIRACAO_MS = 30_000;

export class AgendadorExpiracaoInscricoes {
  private timer: NodeJS.Timeout | undefined;
  private executando = false;

  constructor(
    private readonly expirarInscricoes: ExpirarInscricoesPendentes,
    private readonly intervaloMs: number = INTERVALO_EXPIRACAO_MS,
  ) {
    if (!Number.isSafeInteger(intervaloMs) || intervaloMs <= 0) {
      throw new Error("Intervalo do agendador deve ser um inteiro positivo");
    }
  }

  public iniciar(): void {
    if (this.timer) {
      return;
    }

    void this.executar();
    this.timer = setInterval(() => {
      void this.executar();
    }, this.intervaloMs);
  }

  public parar(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private async executar(): Promise<void> {
    if (this.executando) {
      return;
    }

    this.executando = true;
    try {
      const resultado = await this.expirarInscricoes.execute();
      if (resultado.quantidade_expirada > 0) {
        console.info(`Inscrições expiradas: ${resultado.quantidade_expirada}`);
      }
      if (resultado.quantidade_promovida > 0) {
        console.info(`Inscrições promovidas da fila: ${resultado.quantidade_promovida}`);
      }
    } catch (error) {
      console.error("Falha ao expirar inscrições pendentes:", error);
    } finally {
      this.executando = false;
    }
  }
}
