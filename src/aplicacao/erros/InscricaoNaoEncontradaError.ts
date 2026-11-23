export class InscricaoNaoEncontradaError extends Error {
  constructor(inscricaoId: string) {
    super(`Inscrição com ID ${inscricaoId} não encontrada`);
    this.name = "InscricaoNaoEncontradaError";
  }
}
