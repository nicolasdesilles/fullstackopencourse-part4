const lodash = require("lodash");

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  var amountOfLikes = 0;
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    amountOfLikes += blog.likes;
  }
  return amountOfLikes;
};

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) {
    return NaN;
  }

  var favorite = blogs[0];
  for (let i = 0; i < blogs.length; i++) {
    const blog = blogs[i];
    if (blog.likes > favorite.likes) {
      favorite = blog;
    }
  }

  delete favorite._id;
  delete favorite.url;
  delete favorite.__v;

  return favorite;
};

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return NaN;
  }

  const blogsGroupedByAuthor = lodash.groupBy(blogs, "author");

  var maxBlogs = 0;
  var maxAuthor = "";

  for (let i = 0; i < Object.keys(blogsGroupedByAuthor).length; i++) {
    const currentAuthor = Object.keys(blogsGroupedByAuthor)[i];
    const blogNumber = blogsGroupedByAuthor[currentAuthor].length;
    if (blogNumber > maxBlogs) {
      maxBlogs = blogNumber;
      maxAuthor = currentAuthor;
    }
  }

  return {
    author: maxAuthor,
    blogs: maxBlogs,
  };
};

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return NaN;
  }

  const blogsGroupedByAuthor = lodash.groupBy(blogs, "author");

  var maxLikes = 0;
  var maxAuthor = "";

  for (let i = 0; i < Object.keys(blogsGroupedByAuthor).length; i++) {
    const currentAuthor = Object.keys(blogsGroupedByAuthor)[i];
    const totalAuthorLikes = totalLikes(blogsGroupedByAuthor[currentAuthor]);
    if (totalAuthorLikes > maxLikes) {
      maxLikes = totalAuthorLikes;
      maxAuthor = currentAuthor;
    }
  }

  return {
    author: maxAuthor,
    likes: maxLikes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes,
};
