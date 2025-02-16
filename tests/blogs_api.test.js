const { test, after, beforeEach } = require('node:test')

const Blog = require('../models/blog')

const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const helper = require('./tests_helper')

const app = require('../app')

const api = supertest(app)

beforeEach(async() => {

  await Blog.deleteMany({})

  for (let i=0; i < helper.initialBlogs.length; i++) {
    let blogObject = new Blog(helper.initialBlogs[i])
    await blogObject.save()
  }
})

test('blogs are returned as JSON', async() => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type',/application\/json/)
})

test('there are the correct number of blogs in the test DB', async() => {
  const blogsInDb = await helper.blogsInDb()

  assert.strictEqual(blogsInDb.length,helper.initialBlogs.length)
})

test('the unique identifier field of the blogs is named \'id\'', async() => {
  const blogsInDb = await helper.blogsInDb()
  const hasIDfield = blogsInDb.map(blog => Object.keys(blog).includes('id'))
  const expected = new Array(blogsInDb.length).fill(true)

  assert.deepStrictEqual(hasIDfield,expected)

})

test('a valid blog can be added to the DB', async() => {
  const newBlog = {
    title: 'A new test blog',
    author: 'John Bob',
    url: 'https://pointerpointer.com/',
    likes: 25
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type',/application\/json/)

  const response = await api.get('/api/blogs')

  const title = response.body.map(r => r.title)

  assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
  assert(title.includes('A new test blog'))

})

test('a new blog post without the \'likes\' field gets assigned a number of likes of 0', async() => {
  const newBlog = new Blog({
    title: 'A new test blog without likes',
    author: 'No likes',
    url: 'https://pointerpointer.com/'
  })
  await newBlog.save()

  const newBlogID = newBlog._id.toString()

  const response = await api
    .get(`/api/blogs/${newBlogID}`)
    .expect(200)

  const fetchedNewBlog = response.body

  const likes = fetchedNewBlog.likes

  assert.strictEqual(likes,0)

})

test('adding a blog without a title field to the DB fails', async() => {
  const newBlog = {
    author: 'No title',
    url: 'https://pointerpointer.com/',
    likes: 2
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('adding a blog without a URL field to the DB fails', async() => {
  const newBlog = {
    title: 'No URL',
    author: 'John Bob',
    likes: 2
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)
})

test('deleting a blog post by id from the DB is possible', async() => {
  const newBlog = new Blog({
    title: 'A test blog that will be added then deleted',
    author: 'John Bob',
    url: 'https://pointerpointer.com/',
    likes: 20
  })
  await newBlog.save()

  const newBlogID = newBlog._id.toString()

  await api
    .delete(`/api/blogs/${newBlogID}`)
    .expect(204)

})

after(async() => {
  await mongoose.connection.close()
})