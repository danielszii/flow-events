import { Request, Response } from "express";
import { CreateUsuario } from "../../../../aplicacao/usecase/usuario/CreateUsuario";
import { ListUsuario } from "../../../../aplicacao/usecase/usuario/ListUsuario";
import { DeleteUsuario } from "../../../../aplicacao/usecase/usuario/DeleteUsuario";
import { GetUsuario } from "../../../../aplicacao/usecase/usuario/GetUsuario";

export class UsuarioControle {
  constructor(
    private createUsuario: CreateUsuario,
    private listUsuario: ListUsuario,
    private deleteUsuario: DeleteUsuario,
    private getUsuario: GetUsuario,
  ) { }

  public async criarUsuario(req: Request, res: Response) {
    try {
      const { cpf, nome, email } = req.body;
      const usuario = await this.createUsuario.execute({ cpf, nome, email });
      res.status(201).json({ data: usuario.id, message: "Usuário criado com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Internal server error' });
    }
  }

  public async listar(req: Request, res: Response) {
    try {
      const usuarios = await this.listUsuario.execute();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async removerUsuario(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const result = await this.deleteUsuario.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async buscarUsuarioPorId(req: Request, res: Response) {
    try {
      const id = req.params.id;
      if (typeof id !== "string") {
        res.status(400).json({ error: "ID inválido" });
        return;
      }
      const usuario = await this.getUsuario.execute({ id });
      if (!usuario) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }
      res.status(200).json(usuario);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}