const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  }
  else {
    response.status(404).end()
  }
})

blogsRouter.post('/', async (request, response) => {

  const user = request.user

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: user.id
  })

  const result = await blog.save()

  user.blogs = user.blogs.concat(result._id)
  await user.save()

  response.status(201).json(result)
})

blogsRouter.put('/:id', async (request, response) => {

  const user = request.user

  const blogToUpdate = await Blog.findById(request.params.id)
  const blogCreatorUserId = blogToUpdate.user.toString()

  if (blogCreatorUserId === user.id.toString()) {

    const newBlog = {
      title: request.body.title,
      author: request.body.author,
      url: request.body.url,
      likes: request.body.likes,
      user: user.id
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      newBlog,
      { new: true, runValidators: true, context: 'query' }
    )

    response.status(200).json(updatedBlog)
  }
  else {
    response.status(401).json({ error: 'you are not logged in as the user who saved this blog post' })
  }

})

blogsRouter.delete('/:id', async (request, response) => {

  const user = request.user

  const blogToDelete = await Blog.findById(request.params.id)
  const blogCreatorUserId = blogToDelete.user.toString()

  if (blogCreatorUserId === user.id.toString()) {
    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  }
  else {
    response.status(401).json({ error: 'you are not logged in as the user who saved this blog post' })
  }

})


module.exports = blogsRouter