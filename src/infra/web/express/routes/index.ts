import { Router } from "express";
import { EventoControle } from "../controle/EventoControle";
import { LoteControle } from "../controle/LoteControle";
import { UsuarioControle } from "../controle/UsuarioControle";
import { createEventoRoutes } from "./EventoRoutes";
import { createLoteRoutes } from "./LoteRoutes";
import { createUsuarioRoutes } from "./UsuarioRoutes";

type RouteControllers = {
  eventoControle: EventoControle;
  loteControle: LoteControle;
  usuarioControle: UsuarioControle;
};

export function createRoutes(controllers: RouteControllers): Router {
  const router = Router();

  router.use(createEventoRoutes(controllers.eventoControle));
  router.use(createLoteRoutes(controllers.loteControle));
  router.use(createUsuarioRoutes(controllers.usuarioControle));

  return router;
}