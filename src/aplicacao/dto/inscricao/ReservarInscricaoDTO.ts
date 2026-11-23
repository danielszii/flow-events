export type ReservarInscricaoInputDTO = {
  usuario_id: string;
  evento_id: string;
  lote_id: string;
}

export type ReservarInscricaoOutputDTO =
  | {
    tipo: "RESERVA";
    id: string;
    estado: string;
    expira_em: string;
  }
  | {
    tipo: "FILA_ESPERA";
    id: string;
    estado: "AGUARDANDO";
    criado_em: string;
  };
