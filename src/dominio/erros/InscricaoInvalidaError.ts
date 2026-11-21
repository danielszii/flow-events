export class InscricaoInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InscricaoInvalidaError";
  }
}
