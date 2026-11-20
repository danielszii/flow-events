export type GetEventoInputDTO = {
  id: string;
}

export type GetEventoOutputDTO = {
  id: string;
  titulo: string;
  descricao: string;
  data_hora_inicio: string;
  data_hora_fim: string;
  limite_ingressos_cpf: number;
  estado: string;
  criado_em: string;
} | null