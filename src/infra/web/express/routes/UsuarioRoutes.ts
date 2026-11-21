import { Router } from "express";
import { UsuarioControle } from "../controle/UsuarioControle";

export function createUsuarioRoutes(usuarioControle: UsuarioControle): Router {
  const router = Router();

  router.post("/usuarios", (req, res) => usuarioControle.criarUsuario(req, res));
  router.get("/usuarios", (req, res) => usuarioControle.listar(req, res));
  router.get("/usuarios/:id", (req, res) => usuarioControle.buscarUsuarioPorId(req, res));
  router.delete("/usuarios/:id", (req, res) => usuarioControle.removerUsuario(req, res));

  return router;
}