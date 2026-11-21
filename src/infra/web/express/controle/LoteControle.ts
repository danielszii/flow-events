import { Request, Response } from "express";
import { z } from "zod";
import { EventoNaoEncontradoError } from "../../../../aplicacao/erros/EventoNaoEncontradoError";
import { CreateLote } from "../../../../aplicacao/usecase/lote/CreateLote";
import { ListLotes } from "../../../../aplicacao/usecase/lote/ListLotes";
import { LoteInvalidoError } from "../../../../dominio/erros/LoteInvalidoError";

const createLoteSchema = z.object({
  nome: z.string(),
  preco: z.number().finite(),
  quantidade_total: z.number().int(),
  data_hora_inicio_venda: z.string(),
  data_hora_fim_venda: z.string(),
});

export class LoteControle {
  constructor(
    private readonly createLote: CreateLote,
    private readonly listLotes: ListLotes,
  ) { }

  public async criar(req: Request, res: Response): Promise<void> {
    const eventoId = req.params.eventoId;
    if (typeof eventoId !== "string" || !eventoId.trim()) {
      res.status(400).json({ error: "ID do evento inválido" });
      return;
    }

    const parsedBody = createLoteSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ error: parsedBody.error.flatten() });
      return;
    }

    try {
      const lote = await this.createLote.execute({
        evento_id: eventoId,
        ...parsedBody.data,
      });
      res.status(201).json({ data: lote.id, message: "Lote criado com sucesso!" });
    } catch (error) {
      this.responderErro(error, res);
    }
  }

  public async listarPorEvento(req: Request, res: Response): Promise<void> {
    const eventoId = req.params.eventoId;
    if (typeof eventoId !== "string" || !eventoId.trim()) {
      res.status(400).json({ error: "ID do evento inválido" });
      return;
    }

    try {
      const lotes = await this.listLotes.execute({ evento_id: eventoId });
      res.status(200).json(lotes);
    } catch (error) {
      this.responderErro(error, res);
    }
  }

  private responderErro(error: unknown, res: Response): void {
    if (error instanceof EventoNaoEncontradoError) {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error instanceof LoteInvalidoError) {
      res.status(400).json({ error: error.message });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
