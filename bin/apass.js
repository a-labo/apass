#!/usr/bin/env node

'use strict'

const program = require('commander')
const pkg = require('../package')
const co = require('co')
const colorprint = require('colorprint')
const apass = require('../lib')
const { EOL } = require('os')

let { APASS_VAULT, APASS_PASSWORD } = process.env

const secrets = apass(APASS_VAULT, {
  password: APASS_PASSWORD
})

program
  .version(pkg.version)
  .description(pkg.description)

program
  .command('get <key>')
  .option('-r, --raw', 'Output raw data only')
  .alias('Get a secret value')
  .action((key, options) => co(function * () {
    let val = yield secrets.get(key)
    if (options.raw) {
      process.stdout.write(val)
    } else {
      colorprint.info(`Value for "${key}: `)
      console.log('')
      console.log(val)
      console.log('')
    }
  }).catch(handleError))

program
  .command('all')
  .alias('Get all values')
  .action((options) => co(function * () {
    let data = yield secrets.all()
    colorprint.info('All values: ')
    console.log('')
    for (let key of Object.keys(data)) {
      let val = data[ key ]
      console.log(`${key}: ${val}`)
    }
    console.log('')
  }).catch(handleError))

program
  .command('grep <keyword>')
  .alias('Grep values')
  .action((keyword, options) => co(function * () {
    let data = yield secrets.grep(keyword)
    colorprint.info('Grepped values: ')
    console.log('')
    for (let key of Object.keys(data)) {
      let val = data[ key ]
      console.log(`${key}: ${val}`)
    }
    console.log('')
  }).catch(handleError))

program
  .command('keys')
  .alias('List secret keys')
  .action((options) => co(function * () {
    let keys = yield secrets.keys()
    if (keys.length === 0) {
      colorprint.warn('No keys available!')
      console.log('')
      return
    }
    colorprint.info('Available keys: ')
    console.log(keys.join(EOL))
    console.log('')
  }).catch(handleError))

program
  .command('set <key> <val>')
  .alias('Set a secret value')
  .action((key, val, options) => co(function * () {
    yield secrets.set(key, val)
    colorprint.info(`Value saved for "${key}".`)
    console.log('')
  }).catch(handleError))

program
  .command('del <key>')
  .alias('Delete a secret value')
  .action((key, options) => co(function * () {
    yield secrets.del(key)
    colorprint.info(`Key deleted for "${key}".`)
    console.log('')
  }).catch(handleError))

program
  .command('passwd <password>')
  .alias('Update password')
  .action((password, options) => co(function * () {
    yield secrets.passwd(password)
    colorprint.info('Password updated.')
    console.log('')
  }).catch(handleError))

program
  .command('bind [remote]')
  .alias('Bind to remote git repo')
  .action((remote, options) => co(function * () {
    colorprint.info('Binding to remote git...')
    yield secrets.bind()
    colorprint.info('...binding done!')
    console.log('')
  }).catch(handleError))

program
  .command('pull')
  .alias('Pull from git repo')
  .action((options) => co(function * () {
    colorprint.info('Pulling from git...')
    yield secrets.pull()
    colorprint.info('...pulling done!')
    console.log('')
  }).catch(handleError))

program
  .command('push')
  .alias('Push to git repo')
  .action((options) => co(function * () {
    colorprint.info('Pushing to git...')
    yield secrets.push()
    colorprint.info('...pushing done!')
    console.log('')
  }).catch(handleError))

program.parse(process.argv)

{
  let command = process.argv[ 2 ]
  if (!command) {
    program.outputHelp()
  }
}

/** Handle error */
function handleError (err) {
  console.error(err)
  process.exit(1)
}