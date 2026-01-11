import express from 'express'
const app = express()
const port = process.env.port || 5000;
app.use(express.json())

import authRoutes from './routes/api/auth.js'

app.use("/",authRoutes),

app.get('/', (req, res) => {
  res.send('welcome to learnytics')
})


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})