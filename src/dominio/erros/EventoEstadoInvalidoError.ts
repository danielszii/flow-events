export class EventoEstadoInvalidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EventoEstadoInvalidoError";
  }
}
