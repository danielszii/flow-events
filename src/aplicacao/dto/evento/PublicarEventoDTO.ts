import { EstadoEvento } from "../../../dominio/entidades/Evento";

export type PublicarEventoInputDTO = {
  id: string;
}

export type PublicarEventoOutputDTO = {
  id: string;
  estado: EstadoEvento;
}
