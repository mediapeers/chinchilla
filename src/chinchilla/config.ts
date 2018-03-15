import * as Kekse from 'cookies-js'
import { each } from 'lodash'
import { Tools } from './tools'

export class Cookies {
  static get(...args) {
    return Kekse.get.apply(null, args)
  }
  static set(...args) {
    return Kekse.set.apply(null, args)
  }
  static expire(...args) {
    return Kekse.expire.apply(null, args)
  }
}

export class NoCookies {
  static get(...args) {}
  static set(...args) {}
  static expire(...args) {}
}

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
  static cookiesImpl = Tools.isNode ? NoCookies : Cookies

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
    return Config[name] || Config.cookiesImpl.get(Config.cookieKey(name))
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
    Config.cookiesImpl.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: Config.cookieTimeout})

    if (name !== 'cacheKey') Config.updateCacheKey()
  }

  static clearValue(name): void {
    Config[name] = undefined
    Config.cookiesImpl.expire(Config.cookieKey(name), { domain: Config.domain })

    if (name !== 'cacheKey') Config.updateCacheKey()
  }

  static cookieKey(name): string {
    return `chinchilla.${name}`
  }
}

each(['affiliationId', 'roleId', 'sessionId', 'cacheKey'], (prop) => {
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
