import * as Kekse from 'cookies-js'

import { Context } from './context'

export class Cookies {
  static get(...args) {
    return (typeof window === undefined) ?
      Kekse.get.apply(null, args) : null
  }
  static set(...args) {
    return (typeof window === undefined) ?
      Kekse.set.apply(null, args) : null
  }
  static expire(...args) {
    return (typeof window === undefined) ?
      Kekse.expire.apply(null, args) : null
  }
}

export class Config {
  static endpoints = {}
  static timestamp = Date.now() / 1000 | 0
  static domain: string
  static errorInterceptor: any

  // timestamp to be appended to every request
  // will be the same for a session lifetime

  static setEndpoint(name: string, url: string): void {
    Config.endpoints[name] = url
  }

  static setCookieDomain(domain: string): void {
    Config.domain = domain
  }

  static setErrorInterceptor(fn) {
    Config.errorInterceptor = fn
  }

  static setAffiliationId(id: string): void {
    Config.setValue('affiliationId', id)
  }

  static getAffiliationId(): string {
    return Config.getValue('affiliationId')
  }

  static clearAffiliationId(): void {
    Config.clearValue('affiliationId')
  }

  static setSessionId(id: string): void {
    Config.setValue('sessionId', id)
  }

  static getSessionId(): string {
    return Config.getValue('sessionId')
  }

  static clearSessionId(): void {
    Config.clearValue('sessionId')
    Context.clearCache()
  }

  static getValue(name): string {
    return Config[name] || Cookies.get(Config.cookieKey(name))
  }

  static setValue(name, value): void {
    Config[name] = value
    Cookies.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: 300})
  }

  static clearValue(name): void {
    Config[name] = undefined
    Cookies.expire(Config.cookieKey(name), { domain: Config.domain })
  }

  static cookieKey(name): string {
    return `chinchilla.${name}`
  }
}
