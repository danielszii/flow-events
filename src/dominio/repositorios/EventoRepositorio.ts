import { Evento } from "../entidades/Evento";

export interface EventoRepositorio {
  buscarPorId(id: string): Promise<Evento | null>;
  listar(): Promise<Evento[]>;
  salvar(evento: Evento): Promise<void>;
  remover(id: string): Promise<boolean>;
  atualizar(evento: Evento): Promise<void>;
}