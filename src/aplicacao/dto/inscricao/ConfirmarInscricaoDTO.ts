export type ConfirmarInscricaoInputDTO = {
  id: string;
}

export type ConfirmarInscricaoOutputDTO = {
  id: string;
  estado: string;
  confirmado_em: string | null;
}
