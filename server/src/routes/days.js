import { Router } from 'express';
import { listParks, getDay } from '../controllers/dayController.js';

const router = Router();

router.get('/parks', listParks);
router.get('/days', getDay);

export default router;
