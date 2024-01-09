import express from 'express';
const router = express.Router();
import { getLogs } from '../controller/logs.controller.js';
import isLoggedIn from '../middlewares/auth.middleware.js';

router.get('/', isLoggedIn, getLogs);

export default router;