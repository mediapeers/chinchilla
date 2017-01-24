/// <reference path = "../../typings/promise.d.ts" />
declare var _;

module Chinchilla {
  export interface SlicedCache {
    remove: any[],
    remain: any[]
  }
  export class Utils {
    static sliceCache(arr, size):SlicedCache {
      if (arr.length <= size) return { remove: [], remain: arr};

      var remain = arr.slice(size * -1);

      return {
        remain: remain,
        remove: _.difference(arr, remain)
      }
    }
  }
}
