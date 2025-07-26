const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app  = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')
const User = require('../models/user')

const api = supertest(app)

let newUser = null
let userToken = null

beforeEach(async () => {
  console.log('///')
  await Blog.deleteMany({})
  await User.deleteMany({})

  newUser = await helper.createTestUser()
  userToken = await helper.generateTestToken({username: newUser.username, id: newUser._id})

  const dbUsers = []
  
  for (const user of helper.initialUsers) {
    const passwordHash = await helper.hashTestUserPassword(user.password)
    dbUsers.push({
      username: user.username,
      name: user.name,
      passwordHash
    })
  }

  const blogsWithUser = helper.initialBlogs.map(blog => ({
    ...blog,
    user: newUser._id.toString()
  }))

  await Blog.insertMany(blogsWithUser)
  await User.insertMany(dbUsers)
})

describe('all blog-related tests', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test(`the amount of blogs are returned is ${helper.initialBlogs.length}`, async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const title = response.body.map(e => e.title)
    assert(title.includes('Type wars'))
  })

  test('blogs have id field called id instead of _id', async () => {
    const response = await api.get('/api/blogs')
    for (let blog of response.body) {
      assert.ok(blog.id)
      assert.strictEqual(blog._id, undefined)
    }
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: "I just farted",
      author: "S.M. Ellie",
      url: "http://blogspot.com/ShartInMyPants",
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

    const title = blogsAtEnd.map(b => b.title)
    assert(title.includes('I just farted'))
  })

  test('a blog added without specified likes will default to zero', async () => {
    const newBlog = {
      title: "I just sharted",
      author: "Dert E. Pannies",
      url: "http://blogspot.com/ShartInMyPants",
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const likelessBlog = blogsAtEnd.find(b => b.title === "I just sharted")
    assert.strictEqual(likelessBlog.likes, 0)
  })

  test('if a blog is missing its title or url, a 400 Bad Request error is returned', async () => {
    const newBlog = {
      author: "I Just Shat My Pants-inson Fuarkturd",
      likes: 10,
    }

    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)
  })

  test('a blog can be deleted', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(b => b.title)
    assert(!titles.includes(blogToDelete.title))
  })

  test('a blog\'s likes can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = { likes: blogToUpdate.likes + 10 }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    assert.strictEqual(response.body.likes, updatedData.likes)

    const blogsAtEnd = await helper.blogsInDb()
    const updatedBlog = blogsAtEnd.find(b => b.id === blogToUpdate.id)
    assert.strictEqual(updatedBlog.likes, updatedData.likes)
  })
})

describe('all user-related tests', () => {
  test('users are returned as json', async () => {
    await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('a valid user can be added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "Biangfuck",
      name: "Kenneth Forbes Lay",
      password: "ImmaFuckingBiangfuck!",
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    
    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('a user with a username of less than three characters cannot be added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "Bo",
      name: "Benjamin Tan",
      password: "ImmaFuckingBo!",
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

    const usernames = usersAtEnd.map(user => user.username)
    assert(!usernames.includes(newUser.username))
  })

  test('a user with a password of less than three characters cannot be added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "Biangdurr",
      name: "Benjamin Tan",
      password: 'Bo',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)

    const usernames = usersAtEnd.map(user => user.username)
    assert(!usernames.includes(newUser.username))
  })

  test('a user with the same username as a user already in the database cannot be added', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: "Bianglord",
      name: "Nicholas Liau",
      password: "ImmaFuckingBiangsturbator!",
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})

