const { test, after, beforeEach, describe } = require('node:test')

const Blog = require('../models/blog')

const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('assert')
const helper = require('./tests_helper')

const app = require('../app')

const api = supertest(app)

describe('when some blog posts are initially saved in the DB', () => {

  //wiping the DB and adding test content
  beforeEach(async() => {

    await Blog.deleteMany({})

    for (let i=0; i < helper.initialBlogs.length; i++) {
      let blogObject = new Blog(helper.initialBlogs[i])
      await blogObject.save()
    }
  })

  test('blog posts are returned as JSON', async() => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type',/application\/json/)
  })

  test('all blog posts are returned from the test DB', async() => {
    const blogsInDb = await helper.blogsInDb()

    assert.strictEqual(blogsInDb.length,helper.initialBlogs.length)
  })

  test('the unique identifier field of the blog posts is named \'id\'', async() => {
    const blogsInDb = await helper.blogsInDb()
    const hasIDfield = blogsInDb.map(blog => Object.keys(blog).includes('id'))
    const expected = new Array(blogsInDb.length).fill(true)

    assert.deepStrictEqual(hasIDfield,expected)

  })

  describe('viewing a specific blog post', () => {

    test('succeeds with status code 200 if id is valid', async() => {
      const blogID = '5a422b3a1b54a676234d17f9'
      const response = await api
        .get(`/api/blogs/${blogID}`)
        .expect(200)
        .expect('Content-Type',/application\/json/)

      const title = response.body.title

      assert(title.includes('Canonical string reduction'))

    })

    test('fails with status code 404 if blog post does not exist', async() => {

      await api
        .get(`/api/blogs/${helper.nonExistingID}`)
        .expect(404)

    })

    test('fails with status code 400 if id is invalid', async() => {
      await api
        .get('/api/blogs/0')
        .expect(400)
    })

  })

  describe('addition of a blog post', () => {

    test('succeeds with status code 201 if data is valid', async() => {
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

    test('succeeds with status code 201 and gets default likes value of 0 if the likes field is missing', async() => {
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

    test('fails with status code 400 without a title field', async() => {
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

    test('fails with status code 400 without a URL field', async() => {
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

  })

  describe('deletion of a blog post', () => {

    test('succeeds with status code 204 if id is valid', async() => {
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

    test('fails with status code 404 if blog post does not exist', async() => {
      await api
        .delete(`/api/blogs/${helper.nonExistingID}`)
        .expect(404)
    })

    test('fails with status code 400 if id is invalid', async() => {
      await api
        .delete('/api/blogs/0')
        .expect(400)
    })

  })

  describe('update of a blog post', () => {

    test('update of the likes field succeeds if id is valid', async() => {
      const blogID = '5a422b3a1b54a676234d17f9'
      const newLikes = 500

      let responseBeforeUpdate = await api
        .get(`/api/blogs/${blogID}`)
        .expect(200)
        .expect('Content-Type',/application\/json/)

      delete responseBeforeUpdate.body.likes
      const updatedBlogToSend = { likes: newLikes, ...responseBeforeUpdate.body }

      const responseToUpdate = await api
        .put(`/api/blogs/${blogID}`)
        .send(updatedBlogToSend)
        .expect(200)
        .expect('Content-Type',/application\/json/)

      assert.strictEqual(responseToUpdate.body.likes,newLikes)

    })

  })

})

after(async() => {
  await mongoose.connection.close()
})