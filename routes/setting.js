import express from 'express';
import multer from 'multer';
import path from 'path';
import * as fs from 'fs';
import isLoggedIn from '../middlewares/auth.middleware.js';
import {
  createOrUpdateSetting,
  getFirstSetting,
  getSetting,
  sendTestMail,
} from '../controller/setting.controller.js';

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

  // By default, multer removes file extensions so let's add them back
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname  }-${  Date.now()  }${path.extname(file.originalname)}`
    );
  },
});
const upload = multer({ storage: storage });

router.get('/', isLoggedIn, getFirstSetting);

const cpUpload = upload.fields([
  { name: 'logo', maxCount: 1, storage: storage },
  { name: 'background', maxCount: 1, storage: storage },
]);

router.get('/:id', isLoggedIn, getSetting);
router.post('/', [isLoggedIn, cpUpload], createOrUpdateSetting);
router.post('/send_test_mail', [isLoggedIn], sendTestMail);

export default router;
