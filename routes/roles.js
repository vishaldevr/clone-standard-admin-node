import express from 'express';
import isLoggedIn from '../middlewares/auth.middleware.js';
import logs from '../middlewares/createLogs.js';
import { allRoles, createRole, deleteManyRole, deleteRole, getRole, getRoles, updateRole } from '../controller/roles.controller.js';
const router = express.Router();

router.get('/', [isLoggedIn, logs], getRoles);
router.get('/allroles', [isLoggedIn, logs], allRoles);
router.get('/:id', [isLoggedIn,logs], getRole);
router.post('/', [isLoggedIn,logs], createRole);
router.patch('/:id', [isLoggedIn,logs], updateRole);
router.delete('/:id', [isLoggedIn,logs], deleteRole);
router.post('/delete', [isLoggedIn,logs], deleteManyRole);
export default router;
