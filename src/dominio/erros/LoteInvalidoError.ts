export class LoteInvalidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoteInvalidoError";
  }
}
