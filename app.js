import express from 'express'
const app = express()
const port = process.env.port || 5000;
app.use(express.json())

import authRoutes from './routes/api/auth.js'
// const{signup,signin}=require("./routes/api/auth")
// const auth=require("./routes/api/auth");

app.use("/api/",authRoutes),

app.get('/', (req, res) => {
  res.send('Hello World')
})


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})