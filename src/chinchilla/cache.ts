import { each, isFunction, difference } from 'lodash'
import { Config } from './config'

interface SlicedCache {
    remove: any[],
    remain: any[]
}

export class Cache {
  private static cacheSize  = 250
  private static cacheOrder = []
  private static cache      = {}

  static generateRandomKey(type:string):string {
    var hash = Math.random().toString(36).substr(2, 9)
    return `${type}-${hash}`
  }

  static generateSessionKey(...parts: string[]):string {
    let session = Config.getSessionId() ? Config.getSessionId().substr(2, 9) : 'anonymous'
    return parts.join('-').concat(`-${session}`)
  }

  static add(key:string, obj:any):void {
    Cache.cache[key] = obj
    Cache.cacheOrder.push(key)

    /* disabled for now
    Cache.capCache()
    */
  }

  static get(key:string):any {
    return Cache.cache[key]
  }

  static clear():void {
    Cache.cache = {}
    Cache.cacheOrder = []
  }

  private static capCache():void {
    var sliced = Cache.sliceCache(Cache.cacheOrder, Cache.cacheSize)

    each(sliced.remove, (key) => {
      if (isFunction(Cache.cache[key]['destroy'])) Cache.cache[key].destroy()
      delete Cache.cache[key]
    })

    Cache.cacheOrder = sliced.remain
  }

  private static sliceCache(arr, size):SlicedCache {
    if (arr.length <= size) return { remove: [], remain: arr}

    var remain = arr.slice(size * -1)

    return {
      remain: remain,
      remove: difference(arr, remain)
    }
  }
}
