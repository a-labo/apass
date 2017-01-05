/**
 * Test case for apass.
 * Runs with mocha.
 */
'use strict'

const Apass = require('../lib/apass.js')
const assert = require('assert')
const co = require('co')

describe('apass', function () {
  this.timeout(3000)

  before(() => co(function * () {

  }))

  after(() => co(function * () {

  }))

  it('Apass', () => co(function * () {
    let apass = new Apass(`${__dirname}/../tmp/testing-vault`, {
      password: '1234qwer'
    })
    yield apass.set('foo', 'This is foo')
    assert.equal(yield apass.get('foo'), 'This is foo')
    assert.deepEqual(yield apass.all(), { foo: 'This is foo' })
  }))
})

/* global describe, before, after, it */
