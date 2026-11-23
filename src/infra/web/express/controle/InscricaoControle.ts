import { Request, Response } from "express";
import { z } from "zod";
import { ReservarInscricao } from "../../../../aplicacao/usecase/inscricao/ReservarInscricao";
import { ReservaInscricaoError } from "../../../../aplicacao/erros/ReservaInscricaoError";
import { CancelarInscricao } from "../../../../aplicacao/usecase/inscricao/CancelarInscricao";
import { InscricaoNaoEncontradaError } from "../../../../aplicacao/erros/InscricaoNaoEncontradaError";
import { InscricaoInvalidaError } from "../../../../dominio/erros/InscricaoInvalidaError";

const reservarInscricaoSchema = z.object({
  usuario_id: z.string().trim().min(1),
});

const errosNaoEncontrados = new Set([
  "USUARIO_NAO_ENCONTRADO",
  "EVENTO_NAO_ENCONTRADO",
  "LOTE_NAO_ENCONTRADO",
]);

export class InscricaoControle {
  constructor(
    private readonly reservarInscricao: ReservarInscricao,
    private readonly cancelarInscricao: CancelarInscricao,
  ) {}

  public async reservar(req: Request, res: Response): Promise<void> {
    const { eventoId, loteId } = req.params;
    if (
      typeof eventoId !== "string" || !eventoId.trim()
      || typeof loteId !== "string" || !loteId.trim()
    ) {
      res.status(400).json({ error: "IDs do evento e do lote são obrigatórios" });
      return;
    }

    const parsedBody = reservarInscricaoSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: parsedBody.error.flatten() });
      return;
    }

    try {
      const inscricao = await this.reservarInscricao.execute({
        usuario_id: parsedBody.data.usuario_id,
        evento_id: eventoId,
        lote_id: loteId,
      });

      const aguardandoFila = inscricao.tipo === "FILA_ESPERA";
      res.status(201).json({
        data: inscricao,
        message: aguardandoFila
          ? "Entrada adicionada à fila de espera."
          : "Reserva criada com sucesso!",
      });
    } catch (error) {
      if (error instanceof ReservaInscricaoError) {
        const status = errosNaoEncontrados.has(error.codigo) ? 404 : 409;
        res.status(status).json({ error: error.message, code: error.codigo });
        return;
      }

      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  public async cancelar(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({ error: "ID da inscrição inválido" });
      return;
    }

    try {
      const inscricao = await this.cancelarInscricao.execute({ id });
      res.status(200).json({
        data: inscricao,
        message: "Inscrição cancelada com sucesso!",
      });
    } catch (error) {
      if (error instanceof InscricaoNaoEncontradaError) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof InscricaoInvalidaError) {
        res.status(409).json({ error: error.message });
        return;
      }

      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
