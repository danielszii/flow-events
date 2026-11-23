import { Router } from "express";
import { EventoControle } from "../controle/EventoControle";

export function createEventoRoutes(eventoControle: EventoControle): Router {
  const router = Router();

  router.post("/eventos", (req, res) => eventoControle.criarEvento(req, res));
  router.get("/eventos", (req, res) => eventoControle.listar(req, res));
  router.get("/eventos/:id", (req, res) => eventoControle.buscarEventoPorId(req, res));
  router.put("/eventos/:id", (req, res) => eventoControle.atualizarEvento(req, res));
  router.post("/eventos/:id/publicar", (req, res) => eventoControle.publicar(req, res));
  router.delete("/eventos/:id", (req, res) => eventoControle.removerEvento(req, res));

  return router;
}