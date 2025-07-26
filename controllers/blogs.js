const jwt = require('jsonwebtoken')

const blogsRouter = require('express').Router()

const Blog = require('../models/blog')
const User = require('../models/user') 

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
                          .populate('user', { username: 1, name: 1})
  response.json(blogs)
})
  
blogsRouter.post('/', async (request, response) => {
  const user = request.user

  if (!user) {
    return response.status(400).json({ error: 'user not found' })
  }

  const blog = new Blog({ ...request.body, user: user._id} )
  const savedBlog = await blog.save()
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, response) => {
  const user = request.user
  const blogToDelete = await Blog.findById(request.params.id)

  if (!blogToDelete) {
    return response.status(400).json({ error: 'blog not found' })
  }

  if (!(blogToDelete.user.toString() === user.id)) {
    return response.status(400).json({ error: 'not authorized to delete this blog' })
  }

  await Blog.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
  const body = request.body

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    { likes: body.likes },
    { new: true, runValidators: true, context: 'query' }
  )

  response.json(updatedBlog)
})

module.exports = blogsRouter