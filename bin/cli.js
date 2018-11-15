#!/usr/bin/env node
const _ = require('lodash')
const path = require('path')
const repl = require('repl')
const stubber = require('async-repl/stubber')
const chinchilla = require(path.join(__dirname, '..', 'dist/chinchilla.js')).default

const env = process.argv[2]

const endpoints = {
  production: {
    um: "https://um.api.mediapeers.biz/v20140601",
    pm: "https://pm.api.mediapeers.biz/v20140601",
    am: "https://am.api.mediapeers.biz/v20140601",
    ac: "https://ac.api.mediapeers.biz/v20140601",
    mc: "https://mc.api.mediapeers.biz/v20140601",
    viscacha: "https://viscacha.api.mediapeers.biz",
    tuco: "https://tuco.api.mediapeers.biz",
    pigeon: "https://pigeon.api.mediapeers.biz",
  },
  presentation: {
    um: "https://um.api.mediapeers.us/v20140601",
    pm: "https://pm.api.mediapeers.us/v20140601",
    am: "https://am.api.mediapeers.us/v20140601",
    ac: "https://ac.api.mediapeers.us/v20140601",
    mc: "https://mc.api.mediapeers.us/v20140601",
    viscacha: "https://viscacha.api.mediapeers.us",
    tuco: "https://tuco.api.mediapeers.us",
    pigeon: "https://pigeon.api.mediapeers.us",
  },
  staging: {
    um: "https://um.api.mediapeers.mobi/v20140601",
    pm: "https://pm.api.mediapeers.mobi/v20140601",
    am: "https://am.api.mediapeers.mobi/v20140601",
    ac: "https://ac.api.mediapeers.mobi/v20140601",
    mc: "https://mc.api.mediapeers.mobi/v20140601",
    viscacha: "https://viscacha.api.mediapeers.mobi",
    tuco: "https://tuco.api.mediapeers.mobi",
    pigeon: "https://pigeon.api.mediapeers.mobi",
  },
}
if (!endpoints[env]) throw new Error('unknown env!')

for (const app in endpoints[env]) {
  chinchilla.config.setEndpoint(app, endpoints[env][app])
}
chinchilla.config.setAffiliationId('mpx')

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
_.merge(replInstance.context, {
  chch: chch,
  login: async (email, password) => {
    chch.config.clearSessionId()
    const payload = chch.new('um', 'session', {email,password})
    const result = await chch(payload).$m('create', {}, {withoutSession: true})

    chch.config.setSessionId(result.object.id)
    console.log('> logged in.')
  },
  logout: () => {
    chch.config.clearSessionId()
    console.log('> logged out.')
  }
})
stubber(replInstance)
