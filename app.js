require('dotenv').config()

require('express-async-errors')
const express = require('express')
const mongoose = require('mongoose')

const blogsRouter = require('./controllers/blogs')
const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')

const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

const app = express()

mongoose.connect(config.MONGODB_URI)
  .then(() => logger.info("Successfully connected to MongoDB"))
  .catch(error => logger.error('Error connecting to MongoDB: ', error.message))


app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', middleware.userExtractor, blogsRouter)
app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app