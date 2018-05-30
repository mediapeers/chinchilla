import * as Kekse from 'cookies-js'
import * as qs from 'querystringify'
import { each } from 'lodash'
import { Tools } from './tools'

export class Cookies {
  static get(...args) {
    if (Tools.isNode) return
    return Kekse.get.apply(null, args)
  }
  static set(...args) {
    if (Tools.isNode) return
    return Kekse.set.apply(null, args)
  }
  static expire(...args) {
    if (Tools.isNode) return
    return Kekse.expire.apply(null, args)
  }
}

const valueNames = ['affiliationId', 'roleId', 'sessionId', 'cacheKey', 'flavours']

export class Config {
  static endpoints = {}
  static domain: string
  static errorInterceptor: any
  static cookieTimeout = 30*24*60*60 // 1 month
  static timestamp = Date.now() / 1000 | 0
  static getAffiliationId: Function
  static getRoleId: Function
  static getSessionId: Function
  static getCacheKey: Function
  static setFlavours: Function
  static getFlavours: Function

  static setEndpoint(name: string, url: string): void {
    Config.endpoints[name] = url
  }

  static setCookieDomain(domain: string): void {
    Config.domain = domain
  }

  static setErrorInterceptor(fn) {
    Config.errorInterceptor = fn
  }

  static getValue(name): string {
    return Config[name] || Cookies.get(Config.cookieKey(name))
  }

  static updateCacheKey(): void {
    let affiliationId, roleId, sessionId, cacheKey

    if ( (affiliationId = Config.getValue('affiliationId')) && (roleId = Config.getValue('roleId')) ) {
      cacheKey = `${affiliationId}-${roleId}`
    } else if (sessionId = Config.getValue('sessionId')) {
      cacheKey = sessionId
    } else {
      cacheKey = 'anonymous'
    }
    Config.setValue('cacheKey', cacheKey)
  }

  static setValue(name, value): void {
    Config[name] = value
    Cookies.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: Config.cookieTimeout})

    if (name !== 'cacheKey') Config.updateCacheKey()
  }

  static clearValue(name): void {
    Config[name] = undefined
    Cookies.expire(Config.cookieKey(name), { domain: Config.domain })

    if (name !== 'cacheKey') Config.updateCacheKey()
  }

  static clear(): void {
    each(valueNames, (name) => {
      if (name === 'affiliationId') return
      this.clearValue(name)
    })
  }

  static cookieKey(name): string {
    return `chinchilla.${name}`
  }

  static setFlavour(name, value) {
    let flavours   = Config.activeFlavours
    flavours[name] = value

    Config.setFlavours(qs.stringify(flavours))
    return flavours
  }

  // returns current flavours key/values
  static get activeFlavours() {
    const value = Config.getFlavours()
    return value ? qs.parse(value) : {}
  }
}

each(['affiliationId', 'roleId', 'sessionId', 'cacheKey', 'flavours'], (prop) => {
  const tail = prop.charAt(0).toUpperCase() + prop.slice(1)

  Config[`get${tail}`] = () => {
    return Config.getValue(prop)
  }

  Config[`set${tail}`] = (value) => {
    Config.setValue(prop, value)
  }

  Config[`clear${tail}`] = () => {
    Config.clearValue(prop)
  }
})
