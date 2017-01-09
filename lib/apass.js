/**
 * @class APass
 * @param {string} dirname - Working directory name
 * @param {Object} [options={}] - Optional settings
 */
'use strict'

const co = require('co')
const path = require('path')
const execcli = require('execcli')
const cipherjson = require('cipherjson')
const fmtjson = require('fmtjson')
const { mkdirpAsync } = require('asfs')
const askconfig = require('askconfig')

const DEFAULT_VAULT = `${__dirname}/../vault`
const MASTER_PASSWORD_KEY = '__master_password__'
const SECRET_FILE = 'secret.json'

/** @lends APass */
class APass {
  constructor (dirname = DEFAULT_VAULT, options = {}) {
    const s = this
    let {
      password = null,
      repo = null
    } = options

    Object.assign(s, {
      _vaultDir: dirname,
      _secretFile: path.join(dirname, SECRET_FILE),
      _password: password,
      _repo: repo
    })
  }

  /**
   * Get secret value.
   * @param {string} key
   * @returns {Promise}
   */
  get (key) {
    const s = this
    return co(function * () {
      let cipher = yield s.cipher()
      let data = yield cipher.read(s._secretFile)
      return data && data[ key ]
    })
  }

  /**
   * Get all secret values.
   * @returns {Promise}
   */
  all () {
    const s = this
    return co(function * () {
      let cipher = yield s.cipher()
      let data = yield cipher.read(s._secretFile)
      return data || {}
    })
  }

  /**
   * Grep value
   * @param {string} keyword
   * @returns {Promise}
   */
  grep (keyword) {
    const s = this
    return co(function * () {
      let all = yield s.all()
      return Object.keys(all)
        .filter((name) => name.match(keyword) || name.match(new RegExp(keyword)))
        .reduce((result, name) => Object.assign(result, {
          [name]: all[ name ]
        }), {})
    })
  }

  /**
   * Set secret value
   * @param {string} key
   * @param {string} val - Value to save
   * @returns {Promise}
   */
  set (key, val) {
    const s = this
    return co(function * () {
      let cipher = yield s.cipher()
      let data = yield cipher.read(s._secretFile)
      data = Object.assign(data || {}, {
        [key]: val
      })
      data = fmtjson.sortProperties(data)
      yield cipher.write(s._secretFile, data, {})
    })
  }

  /**
   * Delete secret value
   * @param {string} key
   * @returns {Promise}
   */
  del (key) {
    const s = this
    return co(function * () {
      let cipher = yield s.cipher()
      let data = yield cipher.read(s._secretFile)
      delete data[ key ]
      data = fmtjson.sortProperties(data)
      yield cipher.write(s._secretFile, data, {})
    })
  }

  /**
   * Get available keys
   * @returns {Promise}
   */
  keys () {
    const s = this
    return co(function * () {
      let cipher = yield s.cipher()
      let data = yield cipher.read(s._secretFile, {})
      return Object.keys(data)
    })
  }

  /**
   * Update password
   * @param {string} password
   * @returns {Promise}
   */
  passwd (password) {
    const s = this
    return co(function * () {
      let cipher = yield s.cipher()
      let data = yield cipher.read(s._secretFile, {})
      s._password = password
      yield cipher.write(s._secretFile, data, {})
    })
  }

  /**
   * Pull from git repo
   * @returns {Promise}
   */
  pull () {
    const s = this
    return co(function * () {
      yield s.execGit('pull')
    })
  }

  /**
   * Push to git repo
   * @returns {Promise}
   */
  push () {
    const s = this
    return co(function * () {
      yield s.execGit('add', '.')
      yield s.execGit('commit', '-m', '[apass] Update secrets')
      yield s.execGit('push')
    })
  }

  /**
   * Bind to remote git repository
   * @returns {Promise}
   */
  bind () {
    const as = 'origin'
    const s = this
    let cwd = s._vaultDir
    return co(function * () {
      let remote = s._repo || (yield s.ask('Remote git repository'))
      if (!remote) {
        throw new Error('[apass] remote is required')
      }
      yield mkdirpAsync(cwd)
      try {
        yield s.execGit('clone', remote, '.')
      } catch (e) {
        yield s.execGit('init')
        yield s.execGit('add', SECRET_FILE)
        yield s.execGit('commit', '-m', '[apass] Bind secrets')
        yield s.execGit('push', '-u', as, 'master')
      }
    })
  }

  /**
   * Get cipher instance
   * @returns {Promise}
   */
  cipher () {
    const s = this
    return co(function * () {
      let password = s._password || (yield s.ask('Master password'))
      if (!password) {
        throw new Error('[apass] Password is required')
      }
      let cipher = cipherjson(password)

      let data = yield cipher.read(s._secretFile)

      if (data[ MASTER_PASSWORD_KEY ]) {
        let ok = data[ MASTER_PASSWORD_KEY ] === password
        if (!ok) {
          throw new Error('[apass] Password is wrong!')
        }
      } else {
        data[ MASTER_PASSWORD_KEY ] = password
      }
      return cipher
    })
  }

  /**
   * Execute git command
   * @param cmd
   * @param args
   */
  execGit (cmd, ...args) {
    const s = this
    let cwd = s._vaultDir
    return execcli('git', [ cmd, ...args ], { cwd })
  }

  /**
   * Ask value
   * @param {string} question
   * @returns {Promise}
   */
  ask (question) {
    return co(function * () {
      let asked = yield askconfig({ [question]: null })
      return asked[ question ]
    })
  }
}

module.exports = APass
