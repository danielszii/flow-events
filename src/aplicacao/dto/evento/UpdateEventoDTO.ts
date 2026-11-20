export type UpdateEventoInputDTO = {
  id: string;
  titulo?: string;
  descricao?: string;
  data_hora_inicio?: string;
  data_hora_fim?: string;
  limite_ingressos_cpf?: number;
}

export type UpdateEventoOutputDTO = {
  success: boolean;
  message: string;
}