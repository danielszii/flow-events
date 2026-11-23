import { Router } from "express";
import { EventoControle } from "../controle/EventoControle";
import { InscricaoControle } from "../controle/InscricaoControle";
import { LoteControle } from "../controle/LoteControle";
import { UsuarioControle } from "../controle/UsuarioControle";
import { createEventoRoutes } from "./EventoRoutes";
import { createInscricaoRoutes } from "./InscricaoRoutes";
import { createLoteRoutes } from "./LoteRoutes";
import { createUsuarioRoutes } from "./UsuarioRoutes";

type RouteControllers = {
  eventoControle: EventoControle;
  inscricaoControle: InscricaoControle;
  loteControle: LoteControle;
  usuarioControle: UsuarioControle;
};

export function createRoutes(controllers: RouteControllers): Router {
  const router = Router();

  router.use(createEventoRoutes(controllers.eventoControle));
  router.use(createInscricaoRoutes(controllers.inscricaoControle));
  router.use(createLoteRoutes(controllers.loteControle));
  router.use(createUsuarioRoutes(controllers.usuarioControle));

  return router;
}