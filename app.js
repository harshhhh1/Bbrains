import express from 'express'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import announcementroutes from './routes/announcement.js'
// import dashboardRoutes from './routes/dashboard.js'


const app = express()
const port = process.env.port || 5000;
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())




app.use("/",authRoutes)
app.use("/",announcementroutes)
// app.use("/dashboard",dashboardRoutes)

app.get('/', (req, res) => {
  res.send('welcome yto learnytics!')
})


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
