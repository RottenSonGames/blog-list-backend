const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0
  }  
]

const initialUsers = [
  {
    _id: "7a6969a71f546f76434e27f7",
    username: "Bianglord",
    name: "Sarfraz Suhaimi",
    password: "ImmaFuckingBianglord!",
    __v: 0
  },
    {
    _id: "8a6446d71f546f73234e27d6",
    username: "Biangbrain",
    name: "Siddarth Prabhakar",
    password: "ImmaFuckingBiangbrain!",
    __v: 0
  },
]

const hashTestUserPassword = async (password) => {
  const passwordHash = await bcrypt.hash(password, 10)
  return passwordHash
}

const createTestUser = async () => {
  const passwordHash = await bcrypt.hash('superPassword', 10)
  const user = {
    username: 'testUser',
    name: "Test User",
    passwordHash,
    __v: 0
  }
  const testUser = await new User(user).save()
  return testUser
}

const generateTestToken = async ({ username, id }) => {
  const userForToken = { username, id }
  const testToken = jwt.sign(userForToken, process.env.SECRET)
  return testToken
}

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovesoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, hashTestUserPassword, createTestUser, generateTestToken, nonExistingId, blogsInDb, usersInDb
}