import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authroutes from './routes/auth.routes.js';
import marketroutes from './routes/market.route.js';
import dashboardroutes from './routes/dashboard.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/', authroutes);
app.use('/', dashboardroutes);
app.use('/market',marketroutes)

app.get('/', (req, res) => {
  res.json({message:'Hello from the backend server!'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});