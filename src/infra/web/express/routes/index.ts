import { Router } from "express";

import EventoRoutes from "./EventoRoutes";
import UsuarioRoutes from "./UsuarioRoutes";

const router = Router();

router.use(EventoRoutes);
router.use(UsuarioRoutes);

export default router;