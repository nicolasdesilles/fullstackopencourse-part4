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

module.exports = {
  dummy,
  totalLikes
}