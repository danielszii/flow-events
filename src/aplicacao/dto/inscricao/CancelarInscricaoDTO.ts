export type CancelarInscricaoInputDTO = {
  id: string;
}

export type CancelarInscricaoOutputDTO = {
  id: string;
  estado: string;
  inscricao_promovida_id: string | null;
}
