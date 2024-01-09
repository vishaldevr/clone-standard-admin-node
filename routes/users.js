import express from 'express';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';
import isLoggedIn from '../middlewares/auth.middleware.js';
import logs from '../middlewares/createLogs.js';
import {
  createUser,
  deleteManyUser,
  deleteUser,
  getUser,
  getUsers,
  updateUser,
} from '../controller/user.controller.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    } else {
      cb(null, 'public/');
    }
  },

  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname  }-${  Date.now()  }${path.extname(file.originalname)}`
    );
  },
});
const imageUpload = multer({
  storage: storage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg)$/)) {
      return cb(new Error('Please upload a Image'));
    }
    cb(undefined, true);
  },
});

router.get('/', [isLoggedIn, logs], getUsers);
router.post('/', [isLoggedIn, logs, imageUpload.single('avatar')], createUser);
router.get('/:id', [isLoggedIn, logs], getUser);
router.patch(
  '/:id',
  [isLoggedIn, logs, imageUpload.single('avatar')],
  updateUser
);
router.delete('/:id', [isLoggedIn, logs], deleteUser);
router.post('/delete', [isLoggedIn, logs], deleteManyUser);
export default router;
