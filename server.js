require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const cors = require('cors')
const connectDB = require('./config/dbConnect')
const mongoose  = require('mongoose')
const cookieParser = require('cookie-parser')
const PORT = process.env.PORT || 3500

const errorHandler = require('./middlewares/errorHandler')
const corsOptions = require('./config/corsOptions')

connectDB();

app.use(cors(corsOptions))

app.use(express.json())

app.use(cookieParser())

app.use('/', express.static(path.join(__dirname, 'public')))

// Cache static assets for 1 day
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 86400000 })); // Set maxAge to cache for 1 day


app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))
app.use('/jobs', require('./routes/jobRoutes'))
app.use('/requests', require('./routes/requestRoutes'))
app.use('/reviews', require('./routes/reviewRoutes'))
app.use('/messages', require('./routes/messageRoutes'))
app.use('/proposals', require('./routes/proposalRoutes'))

app.use('/auth', require('./routes/authRoutes'))


app.all('*', (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' })
  } else {
    res.type('txt').send('404 Not Found')
  }
})

app.use(errorHandler)

mongoose.connection.once('open', () => {
  console.log('Conneced to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
})