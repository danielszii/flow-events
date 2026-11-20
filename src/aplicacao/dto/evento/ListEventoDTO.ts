export type ListEventoInputDTO = void;

export type ListEventoOutputDTO = {
  eventos: {
    id: string;
    titulo: string;
    descricao: string;
    data_hora_inicio: string;
    data_hora_fim: string;
    estado: string;
  }[]
}