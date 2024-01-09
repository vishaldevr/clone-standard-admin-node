import express from 'express';
import multer from 'multer';
import {
  signin,
  signup,
  signout,
  userDetails,
  updateProfile,
  resetPassword,
  resettPassword,
  activeAccount,
  forgotPassword,
  getUserPermissions,
} from '../controller/user.controller.js';
import isLoggedIn from '../middlewares/auth.middleware.js';
import logs from '../middlewares/createLogs.js';
import * as fs from 'fs';
import path from 'path';
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

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/signout', isLoggedIn, logs, signout);
router.get('/me', [isLoggedIn, logs], userDetails);
router.post(
  '/update',
  [isLoggedIn, logs, imageUpload.single('avatar')],
  updateProfile
);
router.post('/reset', [isLoggedIn, logs], resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resetToken', resettPassword);
router.post('/active-account', activeAccount);
router.get('/permissions',[isLoggedIn], getUserPermissions);

export default router;
