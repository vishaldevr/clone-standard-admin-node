import express from 'express';
import isLoggedIn from '../middlewares/auth.middleware.js';
import {
  createEmail,
  deleteEmail,
  deleteManyEmail,
  getEmail,
  getEmails,
  updateEmail,
} from '../controller/email.controller.js';

const router = express.Router();

router.post('/', [isLoggedIn], createEmail);
router.get('/', [isLoggedIn], getEmails);
router.get('/:id', [isLoggedIn], getEmail);
router.patch('/:id', [isLoggedIn], updateEmail);
router.delete('/:id', [isLoggedIn], deleteEmail);
router.post('/delete', [isLoggedIn], deleteManyEmail);

export default router;
