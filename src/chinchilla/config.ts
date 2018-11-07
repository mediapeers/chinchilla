import * as Kekse from 'cookies-js'
import * as qs from 'querystringify'
import { each, clone, merge, get } from 'lodash'
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

const configNames  = ['affiliationId', 'roleId', 'sessionId', 'flavours']
const settingNames = ['endpoints', 'cookieTimeout', 'timestamp', 'domain', 'devMode', 'errorInterceptor']

export interface Settings {
  endpoints: any
  cookieTimeout: number
  timestamp: number
  domain?: string
  devMode?: boolean
  errorInterceptor?: Function
}

export class Config {
  getAffiliationId: Function
  setAffiliationId: Function
  clearAffiliationId: Function
  getRoleId: Function
  setRoleId: Function
  clearRoleId: Function
  getSessionId: Function
  setSessionId: Function
  clearSessionId: Function
  getFlavours: Function
  setFlavours: Function
  clearFlavours: Function
  settings: Settings

  static instance: Config

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config()
    return Config.instance
  }

  constructor(settings = {}) {
    this.initGetSet()

    this.settings = merge({
      endpoints: {},
      cookieTimeout: 30*24*60*60, // 1 month
      timestamp: Date.now() / 1000 | 0,
    }, settings)
  }

  initGetSet() {
    each(settingNames, (prop) => {
      Object.defineProperty(this, prop, {
        get: () => {
          console.log(`chinchilla: 'config.${prop}' is deprecated. please use 'config.settings.${prop}' instead.`);
          return get(this.settings, prop)
        },
        set: (value) => {
          console.log(`chinchilla: 'config.${prop}' is deprecated. please use 'config.settings.${prop}' instead.`);
          return this.settings[prop] = value
        }
      })
    })

    each(configNames, (prop) => {
      const tail = prop.charAt(0).toUpperCase() + prop.slice(1)

      this[`get${tail}`] = () => {
        return this.getValue(prop)
      }

      this[`set${tail}`] = (value) => {
        this.setValue(prop, value)
      }

      this[`clear${tail}`] = () => {
        this.clearValue(prop)
      }
    })
  }

  clone(): Config {
    return new Config(clone(this.settings))
  }

  setEndpoint(name: string, url: string): void {
    this.settings.endpoints[name] = url
  }

  setCookieDomain(domain: string): void {
    this.settings.domain = domain
  }

  setErrorInterceptor(fn) {
    this.settings.errorInterceptor = fn
  }

  getValue(name): string {
    return this.settings[name] || Cookies.get(this.cookieKey(name))
  }

  updateCacheKey(): void {
    let affiliationId, roleId, sessionId, cacheKey

    if ( (affiliationId = this.getValue('affiliationId')) && (roleId = this.getValue('roleId')) ) {
      cacheKey = `${affiliationId}-${roleId}`
    } else if (sessionId = this.getValue('sessionId')) {
      cacheKey = sessionId
    } else {
      cacheKey = 'anonymous'
    }
    this.setValue('cacheKey', cacheKey)
  }

  getCacheKey(suffix?: string) {
    return suffix ? `${this.getValue('cacheKey')}-${suffix}` : this.getValue('cacheKey')
  }

  setValue(name, value): void {
    this.settings[name] = value
    Cookies.set(this.cookieKey(name), value, {
      path: '/',
      domain: this.settings.domain,
      expires: this.settings.cookieTimeout,
      secure: !this.settings.devMode,
    })

    if (name !== 'cacheKey') this.updateCacheKey()
  }

  clearValue(name): void {
    this.settings[name] = undefined
    Cookies.expire(this.cookieKey(name), { domain: this.settings.domain })

    if (name !== 'cacheKey') this.updateCacheKey()
  }

  clear(): void {
    each(configNames, (name) => {
      if (name === 'affiliationId') return
      this.clearValue(name)
    })
  }

  cookieKey(name): string {
    return `chinchilla.${name}`
  }

  setFlavour(name, value) {
    let flavours   = this.activeFlavours
    flavours[name] = value

    this.setFlavours(qs.stringify(flavours))
    return flavours
  }

  // returns current flavours key/values
  get activeFlavours() {
    const value = this.getFlavours()
    return value ? qs.parse(value) : {}
  }
}

