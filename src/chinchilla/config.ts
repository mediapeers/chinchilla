import * as Kekse from 'cookies-js'

import { Cache } from './cache'

export class Cookies {
  static get(...args) {
    if (typeof window === 'undefined') return
    return Kekse.get.apply(null, args)
  }
  static set(...args) {
    if (typeof window === 'undefined') return
    return Kekse.set.apply(null, args)
  }
  static expire(...args) {
    if (typeof window === 'undefined') return
    return Kekse.expire.apply(null, args)
  }
}

export class Config {
  static endpoints = {}
  static timestamp = Date.now() / 1000 | 0
  static domain: string
  static errorInterceptor: any
  static cookieTimeout = 30*24*60*60 // 1 month

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
  }

  static getValue(name): string {
    return Config[name] || Cookies.get(Config.cookieKey(name))
  }

  static setValue(name, value): void {
    Config[name] = value
    Cookies.set(Config.cookieKey(name), value, { path: '/', domain: Config.domain, expires: Config.cookieTimeout})
  }

  static clearValue(name): void {
    Config[name] = undefined
    Cookies.expire(Config.cookieKey(name), { domain: Config.domain })
  }

  static cookieKey(name): string {
    return `chinchilla.${name}`
  }
}
