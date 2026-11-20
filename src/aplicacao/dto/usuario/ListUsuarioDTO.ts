export type ListUsuarioInputDTO = void;

export type ListUsuarioOutputDTO = {
  usuarios: {
    id: string;
    cpf: string;
    nome: string;
    email: string;
  }[]
}