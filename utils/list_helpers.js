// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  var amountOfLikes = 0
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i]
    amountOfLikes += blog.likes
  }
  return amountOfLikes
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return NaN
  }

  var favorite = blogs[0]
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i]
    if (blog.likes > favorite.likes) {
      favorite = blog
    }
  }

  delete favorite._id
  delete favorite.url
  delete favorite.__v

  return favorite

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}