const { test, after, beforeEach, describe } = require('node:test')

const Blog = require('../models/blog')
const User = require('../models/user')

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const supertest = require('supertest')
const assert = require('assert')
const helper = require('./tests_helper')

const app = require('../app')

const api = supertest(app)

describe('BLOGS - when some blog posts are initially saved in the DB', () => {

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

    //login into the db as test user for tests and get token
    let token = ''
    beforeEach(async() => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash(helper.testUser.password, 10)
      const user = new User({
        username: helper.testUser.username,
        name: helper.testUser.name,
        passwordHash: passwordHash
      })

      await user.save()

      const response = await api
        .post('/api/login')
        .send({
          username: helper.testUser.username,
          password: helper.testUser.password
        })
        .expect(200)

      token = response.body.token
    })

    test('succeeds with status code 201 if data is valid', async() => {
      const newBlog = {
        title: 'A new test blog',
        author: 'John Bob',
        url: 'https://pointerpointer.com/',
        likes: 25
      }
      await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type',/application\/json/)

      const response = await api.get('/api/blogs')

      const title = response.body.map(r => r.title)

      assert.strictEqual(response.body.length, helper.initialBlogs.length + 1)
      assert(title.includes('A new test blog'))

    })

    test('fails with status code 401 if login token is invalid', async() => {
      const newBlog = {
        title: 'A new test blog',
        author: 'John Bob',
        url: 'https://pointerpointer.com/',
        likes: 25
      }
      await api
        .post('/api/blogs')
        .set({ Authorization: 'Bearer blablabla' })
        .send(newBlog)
        .expect(401)
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
        .set({ Authorization: `Bearer ${token}` })
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
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(400)
    })

  })

  describe('deletion of a blog post', () => {

    //login into the db as test user for tests and get token
    let token = ''
    beforeEach(async() => {
      await User.deleteMany({})

      const passwordHash = await bcrypt.hash(helper.testUser.password, 10)
      const user = new User({
        username: helper.testUser.username,
        name: helper.testUser.name,
        passwordHash: passwordHash
      })

      await user.save()

      const response = await api
        .post('/api/login')
        .send({
          username: helper.testUser.username,
          password: helper.testUser.password
        })
        .expect(200)

      token = response.body.token
    })

    test('succeeds with status code 204 if id is valid', async() => {
      const newBlog = {
        title: 'A test blog that will be added then deleted',
        author: 'John Bob',
        url: 'https://pointerpointer.com/',
        likes: 20
      }
      const response = await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type',/application\/json/)

      const addedBlog = response.body

      const addedBlogID = addedBlog.id
      await api
        .delete(`/api/blogs/${addedBlogID}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(204)
    })

    test('fails with status code 401 if login token is invalid', async() => {
      const newBlog = {
        title: 'A test blog that will be added then deleted',
        author: 'John Bob',
        url: 'https://pointerpointer.com/',
        likes: 20
      }
      const response = await api
        .post('/api/blogs')
        .set({ Authorization: `Bearer ${token}` })
        .send(newBlog)
        .expect(201)
        .expect('Content-Type',/application\/json/)

      const addedBlog = response.body

      const addedBlogID = addedBlog.id
      await api
        .delete(`/api/blogs/${addedBlogID}`)
        .set({ Authorization: 'Bearer blablabla' })
        .expect(401)
    })

    test('fails with status code 404 if blog post does not exist', async() => {
      await api
        .delete(`/api/blogs/${helper.nonExistingID}`)
        .set({ Authorization: `Bearer ${token}` })
        .expect(404)
    })

    test('fails with status code 400 if id is invalid', async() => {
      await api
        .delete('/api/blogs/0')
        .set({ Authorization: `Bearer ${token}` })
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


describe('USERS - when one user is initially saved in the DB', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('supersecret', 10)
    const user = new User({
      username: 'initialUser',
      name: 'Initial User',
      password: passwordHash
    })

    await user.save()
  })

  describe('addition of a user', () => {

    test('succeeds with status code 201 if data is valid', async() => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'johnny',
        name: 'John Bob',
        password: 'verysecure'
      }
      await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type',/application\/json/)

      const usersAtEnd = await helper.usersInDb()
      const usernames = usersAtEnd.map(user => user.username)

      assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)
      assert(usernames.includes(newUser.username))

    })

    test('fails with status code 400 and correct error message if username already exists', async() => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'initialUser',
        name: 'Hey There',
        password: 'veryverysecure'
      }
      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert.strictEqual(response.body.error, 'a user with this username already exists')

    })

    test('fails with status code 400 and correct error message if username is missing', async() => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        name: 'Hey There',
        password: 'veryverysecure'
      }
      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert.match(response.body.error, /User validation failed: username: username is required/)

    })

    test('fails with status code 400 and correct error message if username less than 3 characters long', async() => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'us',
        name: 'Hey There',
        password: 'veryverysecure'
      }
      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()
      //console.log(response.body)
      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert.match(response.body.error, /User validation failed: username: Path.*minimum allowed length \(3\)/)

    })

    test('fails with status code 400 and correct error message if password is missing', async() => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'username',
        name: 'Hey There',
      }
      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert.match(response.body.error, /password is missing/)

    })

    test('fails with status code 400 and correct error message if password is less than 3 characters long', async() => {
      const usersAtStart = await helper.usersInDb()

      const newUser = {
        username: 'username',
        name: 'Hey There',
        password: 'p'
      }
      const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)

      const usersAtEnd = await helper.usersInDb()

      assert.strictEqual(usersAtEnd.length, usersAtStart.length)
      assert.match(response.body.error, /password should be at least 3 characters long/)

    })

  })
})


after(async() => {
  await mongoose.connection.close()
})