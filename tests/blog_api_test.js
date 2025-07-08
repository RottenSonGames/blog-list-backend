const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app  = require('../app')
const helper = require('./test_helper')
const Blog = require('../models/blog')

const api = supertest(app)

beforeEach(async () => {
  console.log('///')
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)
})

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

  const response = await api
    .post('/api/blogs')
    .send(newBlog)
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

after(async () => {
  await mongoose.connection.close()
})

// test('a specific blog can be viewed', async () => {
//   const blogsAtStart = await helper.blogsInDb()
//   const blogToView = blogsAtStart[0]

//   const resultBlog = await api
//     .get(`/api/blogs/${blogToView.id}`)
//     .expect(200)
//     .expect('Content-Type', /application\/json/)

//   assert.deepStrictEqual(resultBlog.body, blogToView)
// })


// test('a valid note can be deleted', async () => {
//   const notesAtStart = await helper.notesInDb()
//   const noteToDelete = notesAtStart[0]

//   await api
//     .delete(`/api/notes/${noteToDelete.id}`)
//     .expect(204)

//   const notesAtEnd = await helper.notesInDb()

//   const contents = notesAtEnd.map(n => n.content)
//   assert(!contents.includes(noteToDelete.content))
//   assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1)
// })

// test('note without content is not added', async () => {
//   const newNote = {
//     important: true,
//   }

//   await api
//     .post('/api/notes')
//     .send(newNote)
//     .expect(400)

//   const notesAtEnd = await helper.notesInDb()
//   assert.strictEqual(notesAtEnd.length, helper.initialNotes.length)
// })

