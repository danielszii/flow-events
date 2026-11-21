export type CreateLoteInputDTO = {
  evento_id: string;
  nome: string;
  preco: number;
  quantidade_total: number;
  data_hora_inicio_venda: string;
  data_hora_fim_venda: string;
}

export type CreateLoteOutputDTO = {
  id: string;
}
