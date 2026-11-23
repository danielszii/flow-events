export type ReservaInscricaoErroCodigo =
  | "USUARIO_NAO_ENCONTRADO"
  | "EVENTO_NAO_ENCONTRADO"
  | "EVENTO_NAO_PUBLICADO"
  | "LOTE_NAO_ENCONTRADO"
  | "LOTE_NAO_PERTENCE_AO_EVENTO"
  | "VENDAS_FECHADAS"
  | "LIMITE_CPF_EXCEDIDO"
  | "JA_NA_FILA";

export class ReservaInscricaoError extends Error {
  constructor(
    public readonly codigo: ReservaInscricaoErroCodigo,
    message: string,
  ) {
    super(message);
    this.name = "ReservaInscricaoError";
  }
}
