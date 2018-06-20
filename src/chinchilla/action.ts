import { isEmpty, isArray, each, isFunction, isPlainObject, map, reject, isString, select, first, get, isUndefined, filter } from 'lodash'
import * as UriTemplate from 'uri-templates'
import * as Promise from 'bluebird'
import { Config } from './config'
import { Result } from './result'
import { Context, ContextAction } from './context'
import { Extractor } from './extractor'
import { Tools } from './tools'

// cleans the object to be send
// * rejects attributes starting with $
// * rejects validation errors and isPristine attribute
// * rejects js functions
// * rejects empty objects {}
// * rejects empty objects within array [{}]
const cleanup = (object) => {
  if (isEmpty(object)) return {}

  var cleaned = {}
  each(object, (value, key) => {
    if (/^\$/.test(key) || key === 'errors' || key === 'isPristine' || isFunction(value)) {
      // skip
    }
    else if (isArray(value)) {
      if (isPlainObject(value[0])) {
        var subset = map(value, (x) => {
          return this.cleanupObject(x)
        })
        cleaned[key] = reject(subset, (x) => {
          return isEmpty(x)
        })
      }
      else {
        cleaned[key] = value
      }
    }
    else if (isPlainObject(value)) {
      var cleanedValue = this.cleanupObject(value)
      if (!isEmpty(cleanedValue)) cleaned[key] = cleanedValue
    }
    else {
      cleaned[key] = value
    }
  })

  return cleaned
}

export class Action {
  ready: Promise<Result>
  params: Object
  options: any
  body: Object
  uriTmpl: UriTemplate
  contextAction: ContextAction
  result: Result = new Result()

  constructor(contextAction: ContextAction, params = {}, body: any, options?: any) {
    this.contextAction  = contextAction
    this.uriTmpl        = new UriTemplate(contextAction.template)
    this.params         = Extractor.uriParams(contextAction, params)
    this.options        = options || {}

    if (this.options.raw) {
      console.log(`chinchilla: option 'raw' is deprecated. please use 'rawRequest' instead.`)
      this.options.rawRequest = this.options.raw
    }
    if (this.options.raw_result) {
      console.log(`chinchilla: option 'raw_result' is deprecated. please use 'rawResult' instead.`)
      this.options.rawResult = this.options.raw_result
    }

    // reformat body to match rails API
    this.body = this.formatBody(body)

    this.ready = new Promise((resolve, reject) => {
      var required = filter(this.contextAction.mappings, 'required')
      for (var index in required) {
        var variable = get(required[index], 'variable')

        if (!this.params[variable]) {
          return reject(new Error(`Required param '${variable}' for '${this.contextAction.template}' missing!`))
        }
      }

      var uri = this.uriTmpl.fillFromObject(this.params)

      var req
      switch (contextAction.method) {
        case 'GET':
          req = Tools.req.get(uri)
          break

        case 'POST':
          req = Tools.req.post(uri)
            .send(this.body)
          break

        case 'PUT':
          req = Tools.req.put(uri)
            .send(this.body)
          break

        case 'PATCH':
          req = Tools.req.patch(uri)
            .send(this.body)
          break

        case 'DELETE':
          req = Tools.req.del(uri)
          break
      }
      // add timestamp
      req = req.query({ t: Config.timestamp })

      // add session by default
      if (!this.options.withoutSession) {
        req = req.set('Session-Id', Config.getSessionId())
      }
      if (Config.getAffiliationId()) {
        req = req.set('Affiliation-Id', Config.getAffiliationId())
      }
      if (Config.getRoleId()) {
        req = req.set('Role-Id', Config.getRoleId())
      }
      if (Config.getFlavours()) {
        req = req.set('Mpx-Flavours', Config.getFlavours())
      }

      // add custom headers
      if (options && (options.header || options.headers)) {
        let headers = options.headers || options.header
      if (typeof headers === 'string')
        req.set(headers, 'true')
      else if (typeof headers === 'object')
        for (var key in headers)
          req.set(key, headers[key])
      }

      // Timeout after 10 seconds if running as backend-for-frontend.
      if (Tools.isNode) {
        req = req.timeout(10000)
      }

      req.end((err, res) => {
        if (err) {
          const [handled, error] = Tools.handleError(err, res)
          return handled ? null : reject(error)
        }

        this.result.success(res, this.options)
        resolve(this.result)
      })
    })
  }

  private formatBody(data) {
    if (isEmpty(data)) return

    var formatted = {}

    if (this.options.rawRequest) {
      formatted = cleanup(data)
    }
    else if (isArray(data)) {
      each(data, (obj) => {
        formatted[obj.id] = this.remapAttributes(cleanup(obj))
      })
    }
    else {
      formatted = this.remapAttributes(cleanup(data))
    }

    return formatted
  }

  private remapAttributes(object) {
    each(object, (value, key) => {
      // split csv string to array
      if (isString(value) && /_ids$/.test(key)) {
        var values = select(value.split(','), (item) => {
          return !isEmpty(item)
        })
        object[key] = values
      }
      // append '_attributes' to nested objects (attributes that are an object or are an array of objects)
      else if (isPlainObject(value) || (isArray(value) && isPlainObject(first(value)))) {
        object[`${key}_attributes`] = value
        delete object[key]
      }
    })
    return object
  }
}
