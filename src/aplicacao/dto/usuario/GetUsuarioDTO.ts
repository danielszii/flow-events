export type GetUsuarioInputDTO = {
  id: string;
}

export type GetUsuarioOutputDTO = {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  criado_em: string;
} | null