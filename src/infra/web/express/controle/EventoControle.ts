import { Request, Response } from "express";
import { CreateEvento } from "../../../../aplicacao/usecase/evento/CreateEvento";
import { ListEvento } from "../../../../aplicacao/usecase/evento/ListEvento";
import { DeleteEvento } from "../../../../aplicacao/usecase/evento/DeleteEvento";
import { GetEvento } from "../../../../aplicacao/usecase/evento/GetEvento";
import { UpdateEvento } from "../../../../aplicacao/usecase/evento/UpdateEvento";

export class EventoControle {
  constructor(
    private createEvento: CreateEvento,
    private listEvento: ListEvento,
    private deleteEvento: DeleteEvento,
    private getEvento: GetEvento,
    private updateEvento: UpdateEvento,
  ) { }

  public async criarEvento(req: Request, res: Response) {
    try {
      const { titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf } = req.body;
      const evento = await this.createEvento.execute({ titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf });
      res.status(201).json({ data: evento.id, message: "Evento criado com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  }

  public async listar(req: Request, res: Response) {
    try {
      const eventos = await this.listEvento.execute();
      res.status(200).json(eventos);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async removerEvento(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const result = await this.deleteEvento.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async buscarEventoPorId(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const evento = await this.getEvento.execute({ id });
      if (!evento) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }
      res.status(200).json(evento);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async atualizarEvento(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const { titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf } = req.body;
      const result = await this.updateEvento.execute({
        id, titulo, descricao, data_hora_inicio, data_hora_fim, limite_ingressos_cpf
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  }
}