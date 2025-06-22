const { test, describe } = require("node:test");
const assert = require("node:assert");

const listHelper = require("../utils/list_helpers");

const emptyList = [];
const listWithOneBlog = [
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf",
    likes: 5,
    __v: 0,
  },
];
const listWithManyBlogs = [
  {
    _id: "5a422a851b54a676234d17f7",
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7,
    __v: 0,
  },
  {
    _id: "5a422aa71b54a676234d17f8",
    title: "Go To Statement Considered Harmful",
    author: "Edsger W. Dijkstra",
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
    likes: 5,
    __v: 0,
  },
  {
    _id: "5a422b3a1b54a676234d17f9",
    title: "Canonical string reduction",
    author: "Edsger W. Dijkstra",
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
    likes: 12,
    __v: 0,
  },
  {
    _id: "5a422b891b54a676234d17fa",
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10,
    __v: 0,
  },
  {
    _id: "5a422ba71b54a676234d17fb",
    title: "TDD harms architecture",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
    likes: 0,
    __v: 0,
  },
  {
    _id: "5a422bc61b54a676234d17fc",
    title: "Type wars",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
    likes: 2,
    __v: 0,
  },
];

test("Dummy function returns 1", () => {
  const blogs = [];
  const result = listHelper.dummy(blogs);
  assert.strictEqual(result, 1);
});

describe("totalLikes Function", () => {
  test("Function call on an empty list returns 0", () => {
    const result = listHelper.totalLikes(emptyList);
    assert.strictEqual(result, 0);
  });

  test("Function call on a list with one blog return the amount of likes of that blog", () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });

  test("Function call on a bigger list calculates the right amount", () => {
    const result = listHelper.totalLikes(listWithManyBlogs);
    assert.strictEqual(result, 36);
  });
});

describe("favoriteBlog Function", () => {
  test("Function call on an empty list returns NaN", () => {
    const result = listHelper.favoriteBlog(emptyList);
    assert.deepStrictEqual(result, NaN);
  });

  test("Function call on a list with one blog returns that blog", () => {
    const result = listHelper.favoriteBlog(listWithOneBlog);
    const expectedResult = {
      title: "Go To Statement Considered Harmful",
      author: "Edsger W. Dijkstra",
      likes: 5,
    };
    assert.deepStrictEqual(result, expectedResult);
  });

  test("Function call on a bigger list returns the right blog", () => {
    const result = listHelper.favoriteBlog(listWithManyBlogs);
    const expectedResult = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    };
    assert.deepStrictEqual(result, expectedResult);
  });
});

describe("mostBlogs Function", () => {
  test("Function call on an empty list returns NaN", () => {
    const result = listHelper.mostBlogs(emptyList);
    assert.deepStrictEqual(result, NaN);
  });

  test("Function call on a list with one blog returns the author of that blog and a number of 1 blog", () => {
    const result = listHelper.mostBlogs(listWithOneBlog);
    const expectedResult = {
      author: "Edsger W. Dijkstra",
      blogs: 1,
    };
    assert.deepStrictEqual(result, expectedResult);
  });

  test("Function call on a bigger list returns the right author and the right amount of blogs", () => {
    const result = listHelper.mostBlogs(listWithManyBlogs);
    const expectedResult = {
      author: "Robert C. Martin",
      blogs: 3,
    };
    assert.deepStrictEqual(result, expectedResult);
  });
});

describe("mostLikes Function", () => {
  test("Function call on an empty list returns NaN", () => {
    const result = listHelper.mostLikes(emptyList);
    assert.deepStrictEqual(result, NaN);
  });

  test("Function call on a list with one blog returns the author of that blog and a number of 1 blog", () => {
    const result = listHelper.mostLikes(listWithOneBlog);
    const expectedResult = {
      author: "Edsger W. Dijkstra",
      likes: 5,
    };
    assert.deepStrictEqual(result, expectedResult);
  });

  test("Function call on a bigger list returns the right author and the right amount of blogs", () => {
    const result = listHelper.mostLikes(listWithManyBlogs);
    const expectedResult = {
      author: "Edsger W. Dijkstra",
      likes: 17,
    };
    assert.deepStrictEqual(result, expectedResult);
  });
});
