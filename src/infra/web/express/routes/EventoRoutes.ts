import { Router } from 'express';
import { controllers } from '../../../../config/composition-root';

const router = Router();

router.post('/eventos', (req, res) => controllers.eventoControle.criarEvento(req, res));
router.get('/eventos', (req, res) => controllers.eventoControle.listar(req, res));
router.get('/eventos/:id', (req, res) => controllers.eventoControle.buscarEventoPorId(req, res));
router.put('/eventos/:id', (req, res) => controllers.eventoControle.atualizarEvento(req, res));
router.delete('/eventos/:id', (req, res) => controllers.eventoControle.removerEvento(req, res));

export default router;