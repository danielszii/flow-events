import { Router } from 'express';
import { controllers } from '../../../../config/composition-root';

const router = Router();

router.post('/usuarios', (req, res) => controllers.usuarioControle.criarUsuario(req, res));
router.get('/usuarios', (req, res) => controllers.usuarioControle.listar(req, res));
router.get('/usuarios/:id', (req, res) => controllers.usuarioControle.buscarUsuarioPorId(req, res));
router.delete('/usuarios/:id', (req, res) => controllers.usuarioControle.removerUsuario(req, res));

export default router;