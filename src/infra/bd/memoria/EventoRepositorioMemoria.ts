import { Evento, EventoProps } from "../../../dominio/entidades/Evento";
import { EventoRepositorio } from "../../../dominio/repositorios/EventoRepositorio";

export class EventoRepositorioMemoria implements EventoRepositorio {
  private readonly eventos = new Map<string, EventoProps>();

  public async buscarPorId(id: string): Promise<Evento | null> {
    const evento = this.eventos.get(id);
    return evento ? Evento.fromPersistence({ ...evento }) : null;
  }

  public async listar(): Promise<Evento[]> {
    return [...this.eventos.values()]
      .map((evento) => Evento.fromPersistence({ ...evento }));
  }

  public async salvar(evento: Evento): Promise<void> {
    if (this.eventos.has(evento.id)) {
      throw new Error(`Evento com ID ${evento.id} já existe`);
    }

    this.eventos.set(evento.id, evento.toPersistence());
  }

  public async remover(id: string): Promise<boolean> {
    return this.eventos.delete(id);
  }

  public async atualizar(evento: Evento): Promise<void> {
    const existente = this.eventos.get(evento.id);
    if (!existente) {
      return;
    }

    const atualizado = evento.toPersistence();
    this.eventos.set(evento.id, {
      ...existente,
      titulo: atualizado.titulo,
      descricao: atualizado.descricao,
      data_hora_inicio: atualizado.data_hora_inicio,
      data_hora_fim: atualizado.data_hora_fim,
      limite_ingressos_cpf: atualizado.limite_ingressos_cpf,
      estado: atualizado.estado,
    });
  }
}
