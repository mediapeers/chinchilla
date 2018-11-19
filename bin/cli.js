#!/usr/bin/env node
const _ = require('lodash')
const path = require('path')
const repl = require('repl')
const stubber = require('async-repl/stubber')
const yaml = require('js-yaml')
const fs = require('fs')
const os = require('os')
const chinchilla = require(path.join(__dirname, '..', 'dist/chinchilla.js')).default

const defaultConfigPath = path.join(__dirname, '..', 'config/default.yml')
const localConfigPath = path.join(os.homedir(), '.chinchilla.yml')

let config
if (fs.existsSync(localConfigPath)) {
  console.log("> using custom config from  '" + localConfigPath + "'")
  config = yaml.safeLoad(fs.readFileSync(localConfigPath, 'utf8'))
}
else {
  console.log("> using default config")
  config = yaml.safeLoad(fs.readFileSync(defaultConfigPath, 'utf8'))
}

let env = process.argv[2]
let affiliation = process.argv[3]

if (env) {
  console.log("> using env '" + env + "'")
}
else {
  console.log("> no 'env' given! assuming 'development'")
  env = 'development'
}
if (affiliation) {
  console.log("> using affiliation '" + affiliation + "'")
}
else {
  console.log("> no 'affiliation' given! assuming 'mpx'")
  affiliation = 'mpx'
}

if (!_.get(config, env + '.endpoints') ) throw new Error("config missing for '" + env + "'!")

for (const app in config[env]['endpoints']) {
  chinchilla.config.setEndpoint(app, config[env]['endpoints'][app])
}
chinchilla.config.setAffiliationId(affiliation)

// overwrite chch to always pass in config
// chch calls without config are not allowed in node context usually
const chch = Object.assign(
  (one, two, three) => {
    if (_.isString(one)) return chinchilla(one, two, chinchilla.config)
    else return chinchilla(one, chinchilla.config)
  },
  chinchilla
)

const replInstance = repl.start({ prompt: 'chch> ' })

Object.assign(replInstance.context, {
  chch: chch,
  login: async (email, password) => {
    if (!email || !password ) {
      const credentials = _.get(config, env + '.credentials.' + affiliation)
      if (credentials) {
        console.log('> using credentials from config file')
        email = credentials.emails
        password = credentials.password
      }
      else {
        console.log("> credentials for '" + env + "/" + affiliation + "' not configured. aborting")
        return
      }
    }

    chch.config.clearSessionId()
    const payload = chch.new('um', 'session', {email,password})
    const result = await chch(payload).$m('create', {}, {withoutSession: true})

    chch.config.setSessionId(result.object.id)
    console.log('> logged in')
  },
  logout: () => {
    chch.config.clearSessionId()
    console.log('> logged out')
  },
})
Object.defineProperty(replInstance.context, 'exit', {
  get: () => {
    console.log('> bye')
    process.exit()
  }
})

stubber(replInstance)
