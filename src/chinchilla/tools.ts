import * as request from 'superagent'
import { get, result } from 'lodash'
import { Config } from './config'
import { Cache } from './cache'
//import * as sdebug from 'superdebug'
//import * as http from 'http'

export class Tools {
  static get isNode() {
    return typeof window === 'undefined'
  }

  static get req() {
    if (Tools.isNode) {
      //const agent = new http.Agent()
      //agent.maxSockets = 100

      return request
        .agent()
        //.use(sdebug(console.info))
        .set({ "Accept-Encoding" : "gzip,deflate" })
    }
    else {
      return request
    }
  }

  static handleError(err, res, config: Config) {
    var error = new Error(get(res, 'body.description') || get(err, 'response.statusText') || 'No error details available')

    if (res) {
      error['headers']    = res.headers
      error['object']     = res.body
      error['statusCode'] = res.statusCode
      error['statusText'] = res.statusText
      error['url']        = res.req.url
      error['method']     = res.req.method
      error['stack']      = err.stack
    }
    else {
      const errMsg = result(err, 'toString')
      error['statusCode'] = 500
      error['statusText'] = errMsg || 'Unknown error'
    }

    // session timed out, reset cookies and caches
    if (error['statusCode'] === 419) {
      Cache.clear()
      config.clear()
    }

    if (config.settings.errorInterceptor) {
      if (config.settings.errorInterceptor(error)) return [true, error]
    }

    return [false, error]
  }
}
