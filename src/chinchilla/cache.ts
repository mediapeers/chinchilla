/// <reference path = "../../typings/promise.d.ts" />
declare var _;

module Chinchilla {
  interface SlicedCache {
    remove: any[],
    remain: any[]
  }

  export class Cache {
    private static instance:Cache;
    private cacheSize = 50;
    private cache:any = {};

    constructor() {
      if (Cache.instance) throw new Error("Error - use Cache.getInstance()");
      this.cache.order = [];
    }

    static getInstance():Cache {
      Cache.instance = Cache.instance || new Cache();
      return Cache.instance;
    }

    static generateKey(type:string):string {
      var hash = Math.random().toString(36).substr(2, 9);
      return `${type}-${hash}`;
    }

    add(key:string, obj:any):void {
      this.cache[key] = obj;
      this.cache.order.push(key);
      this.capCache();
    }

    get(key:string):any {
      return this.cache[key];
    }

    private capCache():void {
      var sliced = Cache.sliceCache(this.cache.order, this.cacheSize);

      _.each(sliced.remove, (key) => {
        if (_.isFunction(this.cache[key]['destroy'])) this.cache[key].destroy();
        delete this.cache[key];
      });

      this.cache.order = sliced.remain;
    }

    private static sliceCache(arr, size):SlicedCache {
      if (arr.length <= size) return { remove: [], remain: arr};

      var remain = arr.slice(size * -1);

      return {
        remain: remain,
        remove: _.difference(arr, remain)
      }
    }
  }
}
