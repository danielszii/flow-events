export type ListLotesInputDTO = {
  evento_id: string;
}

export type ListLotesOutputDTO = {
  lotes: {
    id: string;
    evento_id: string;
    nome: string;
    preco: number;
    quantidade_total: number;
    data_hora_inicio_venda: string;
    data_hora_fim_venda: string;
    criado_em: string;
  }[];
}
