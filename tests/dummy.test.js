const { test } = require('node:test')
const assert = require('node:assert')

const listHelper = require('../utils/list_helpers')

test('Dummy function returns 1', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  assert.strictEqual(result,1)
})

