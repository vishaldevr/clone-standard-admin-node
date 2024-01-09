import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import connectDb from './config/db.js';
import indexRouter from './routes/index.js';
dotenv.config();

import { fileURLToPath } from 'url';
import path,{ dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
// eslint-disable-next-line no-unused-vars
const CONNECTION_URL =
  // eslint-disable-next-line no-undef
  process.env.APP_MONGO_URL || 'mongodb://localhost:27017/standard-clone';
connectDb();

// eslint-disable-next-line no-undef
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use('/public', express.static('public'));

app.use(express.static(path.resolve(__dirname, './client/build')));
// routes

app.use(indexRouter);

export default app.listen(PORT, () =>
  console.log(`Server Running on Port: http://localhost:${PORT}`)
);
