export class FilaEsperaInvalidaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FilaEsperaInvalidaError";
  }
}
