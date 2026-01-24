import express from 'express';
import dotenv from 'dotenv';
import authroutes from './routes/auth.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authroutes);

app.get('/', (req, res) => {
  res.json({message:'Hello from the backend server!'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});