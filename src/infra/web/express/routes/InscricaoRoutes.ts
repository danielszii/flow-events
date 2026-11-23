import { Router } from "express";
import { InscricaoControle } from "../controle/InscricaoControle";

export function createInscricaoRoutes(inscricaoControle: InscricaoControle): Router {
  const router = Router();

  router.post(
    "/eventos/:eventoId/lotes/:loteId/inscricoes",
    (req, res) => inscricaoControle.reservar(req, res),
  );
  router.delete(
    "/inscricoes/:id",
    (req, res) => inscricaoControle.cancelar(req, res),
  );

  return router;
}
