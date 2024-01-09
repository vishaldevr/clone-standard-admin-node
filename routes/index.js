import express from 'express';
import authRouter from './auth.js';
import userRouter from './users.js';
import roleRouter from './roles.js';
import logRouter from './logs.js';
import emailRouter from './email.js';
import settingRouter from './setting.js';
const app = express();

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/roles', roleRouter);
app.use('/logs', logRouter);
app.use('/emails', emailRouter);
app.use('/settings', settingRouter);
export default app;
