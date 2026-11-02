export type CreateEventoInputDTO = {
    nome: string;
    descricao: string;
    dataInicio: Date;
    dataFim: Date;
    local: string;
    imagemUrl: string;
    tipo: string;
    categoria: string;
    valor: number;
    idadeMinima: number;
    status: string;
    criadoPor: number;
    atualizadoPor: number;
}