export type UpdateUsuarioInputDTO = {
  id: string;
  nome?: string;
  email?: string;
}

export type UpdateUsuarioOutputDTO = {
  success: boolean;
  message: string;
}