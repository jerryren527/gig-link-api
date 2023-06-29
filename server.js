require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
// const cors = require('cors')
const connectDB = require('./config/dbConnect')
const mongoose  = require('mongoose')
const PORT = process.env.PORT || 3500

connectDB();

app.use(express.json())

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/users', require('./routes/userRoutes'))
app.use('/jobs', require('./routes/jobRoutes'))
app.use('/requests', require('./routes/requestRoutes'))
app.use('/reviews', require('./routes/reviewRoutes'))
app.use('/messages', require('./routes/messageRoutes'))
app.use('/proposals', require('./routes/proposalRoutes'))

mongoose.connection.once('open', () => {
  console.log('Conneced to MongoDB')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
})