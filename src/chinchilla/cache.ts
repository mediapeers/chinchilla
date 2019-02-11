import { each, startsWith } from 'lodash'
import { Config } from './config'
import { Tools } from './tools'

const PREFIX = 'chch'

export abstract class BaseCache {
  protected storage

  abstract getValue(extkey: string)
  abstract setValue(extkey: string, val: any)
  abstract removeValue(extkey: string)
  abstract clear()

  put(extkey: string, val: any, expires: number = 60) {
    const payload = {
      expires: this.minutesFromNow(expires),
      value: val
    }
    this.setValue(extkey, payload)
  }

  fetch(extkey: string) {
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

  drop(extkey: string) {
    this.removeValue(extkey)
  }

  change(extkey, fn?, defaultValue?, expires: number = 60) {
    let val = this.fetch(extkey) || defaultValue
    if (fn) { val = fn(val) }
    this.put(extkey, val, expires)
  }

  set(key: string, val: any, expires: number = 60) {
    this.put(Config.instance.getCacheKey(key), val, expires)
  }

  get(key: string) {
    return this.fetch(Config.instance.getCacheKey(key))
  }

  remove(key: string) {
    this.drop(Config.instance.getCacheKey(key))
  }

  update(key: string, fn?, defaultValue?, expires: number = 60) {
    return this.change(Config.instance.getCacheKey(key), fn, defaultValue, expires)
  }

  minutesFromNow(min:number) {
    return Date.now() + min*60000
  }
}

export class NoCache extends BaseCache {
  setValue(..._args) {}
  removeValue(..._args) {}
  clear(..._args) {}
  getValue(..._args) {}
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
    const keyparts = extkey.split('*')

    if (keyparts.length > 1) {
      const toDelete = []

      each(this.storage, (_val, key) => {
        if (startsWith(key, keyparts[0])) toDelete.push(key)
      })

      each(toDelete, (key) => delete this.storage[key])
    }
    else {
      delete this.storage[extkey]
    }
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
    extkey = `${PREFIX}-${extkey}`
    this.storage.setItem(extkey, JSON.stringify(val))
  }

  getValue(extkey: string) {
    extkey = `${PREFIX}-${extkey}`
    return JSON.parse(this.storage.getItem(extkey) || null)
  }

  removeValue(extkey: string) {
    extkey = `${PREFIX}-${extkey}`
    const keyparts = extkey.split('*')

    if (keyparts.length > 1) {
      const toDelete = []

      for (var i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (startsWith(key, keyparts[0])) toDelete.push(key)
      }

      each(toDelete, (key) => this.storage.removeItem(key))
    }
    else {
      this.storage.removeItem(extkey)
    }
  }

  clear() {
    const toDelete = []

    for (var i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (startsWith(key, PREFIX)) toDelete.push(key)
    }

    each(toDelete, (key) => this.storage.removeItem(key))
  }
}

export class Cache {
  public storage: BaseCache
  public runtime: BaseCache

  static _instance: Cache

  constructor() {
    this.runtime = new RuntimeCache()
    this.storage = Tools.isNode ? new NoCache() : new StorageCache()
  }

  clear() {
    this.storage.clear()
    this.runtime.clear()
  }

  random(prefix:string = 'unknown') {
    const hash = Math.random().toString(36).substr(2, 9)
    return `${prefix}-${hash}`
  }

  static get instance() {
    if (!Cache._instance) Cache._instance = new Cache()
    return Cache._instance
  }
}
