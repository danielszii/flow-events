import { Router } from "express";
import { LoteControle } from "../controle/LoteControle";

export function createLoteRoutes(loteControle: LoteControle): Router {
  const router = Router();

  router.post(
    "/eventos/:eventoId/lotes",
    (req, res) => loteControle.criar(req, res),
  );
  router.get(
    "/eventos/:eventoId/lotes",
    (req, res) => loteControle.listarPorEvento(req, res),
  );

  return router;
}
