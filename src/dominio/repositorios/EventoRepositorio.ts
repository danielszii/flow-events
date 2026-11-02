import { Evento } from "../entidades/Evento";

export interface EventoRepositorio {
    criar(evento: Evento): Promise<Evento>;
    atualizar(evento: Evento): Promise<Evento>;
    excluir(id: number): Promise<void>;
    buscarPorId(id: number): Promise<Evento | null>;
    buscarTodos(): Promise<Evento[]>;
}