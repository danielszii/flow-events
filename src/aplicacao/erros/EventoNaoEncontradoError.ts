export class EventoNaoEncontradoError extends Error {
  constructor(eventoId: string) {
    super(`Evento com ID ${eventoId} não encontrado`);
    this.name = "EventoNaoEncontradoError";
  }
}
