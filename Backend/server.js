import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authroutes from './routes/auth.routes.js';
import marketroutes from './routes/market.route.js';
import dashboardroutes from './routes/dashboard.routes.js';
import userroutes from './routes/user.routes.js';
import academicroutes from './routes/academic.routes.js';
import walletroutes from './routes/wallet.routes.js';
import logroutes from './routes/log.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', authroutes);
app.use('/', dashboardroutes);
app.use('/market', marketroutes);
app.use('/user', userroutes);
app.use('/academic', academicroutes);
app.use('/wallet', walletroutes);
app.use('/logs', logroutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Learnlytics!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});