const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const Blog = require('../models/blog')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({})
                          .populate('blogs', {url: 1, title: 1, author: 1} )
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (!username || !password) {
    return response.status(400).json({ error: 'either username or password is missing'})
  }

  if (username.length < 3 || password.length < 3) {
    return response.status(400).json({ error: 'both username and password must be at least three characters long' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
    blogs: []
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.delete('/:id', async (request, response) => {
  await User.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

usersRouter.put('/:id', async (request, response) => {
  const user = await User.findById(request.params.id)

  const userBlogs = await Blog.find({user: request.params.id})
  user.blogs = userBlogs
  
  const updatedUser = await user.save()
  response.json(updatedUser)
})

module.exports = usersRouter