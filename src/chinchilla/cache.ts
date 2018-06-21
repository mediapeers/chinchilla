import { each } from 'lodash'
import { Config } from './config'
import { Tools } from './tools'

export abstract class BaseCache {
  protected storage

  abstract getValue(extkey: string)
  abstract setValue(extkey: string, val: any)
  abstract removeValue(extkey: string)
  abstract clear()

  set(key: string, val: any, expires: number = 60) {
    const payload = {
      expires: this.minutesFromNow(expires),
      value: val
    }
    this.setValue(this.extkey(key), payload)
  }

  get(key: string) {
    const extkey = this.extkey(key)
    const payload = this.getValue(extkey)

    if (payload) {
      if (Date.now() > payload.expires) {
        this.removeValue(extkey)
        return null
      }

      return payload.value
    }

    return null
  }

  extkey(suffix:string) {
    return `${Config.getCacheKey()}-${suffix}`
  }

  minutesFromNow(min:number) {
    return Date.now() + min*60000
  }
}

export class RuntimeCache extends BaseCache {
  constructor() {
    super()
    this.storage = {}
  }

  setValue(extkey: string, val: any) {
    this.storage[extkey] = val
  }

  getValue(extkey: string) {
    return this.storage[extkey]
  }

  removeValue(extkey: string) {
    delete this.storage[extkey]
  }

  clear() {
    this.storage = {}
  }
}

export class StorageCache extends BaseCache {
  constructor() {
    super()
    this.storage = window.localStorage
  }

  setValue(extkey: string, val: any) {
    if (Config.devMode) return

    this.storage.setItem(extkey, JSON.stringify(val))
  }

  getValue(extkey: string) {
    return JSON.parse(this.storage.getItem(extkey) || null)
  }

  removeValue(extkey: string) {
    this.storage.removeItem(extkey)
  }

  clear() {
    this.storage.clear()
  }
}

export class Cache {
  private static _storage
  private static _runtime

  static clear() {
    if (!Tools.isNode) Cache.storage.clear()
    Cache.runtime.clear()
  }

  static random(prefix:string = 'unknown') {
    const hash = Math.random().toString(36).substr(2, 9)
    return `${prefix}-${hash}`
  }

  static get storage() {
    if (Cache._storage) return Cache._storage
    return Cache._storage = new StorageCache()
  }

  static get runtime() {
    if (Cache._runtime) return Cache._runtime
    return Cache._runtime = new RuntimeCache()
  }
}
