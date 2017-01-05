/**
 * Create an APass instance
 * @function create
 */
'use strict'

const APass = require('./apass')

/** @lends create */
function create (...args) {
  return new APass(...args)
}

module.exports = create
