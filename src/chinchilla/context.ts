import { each, first, isEmpty } from 'lodash'
import * as Promise from 'bluebird'
import { Config } from './config'
import { Cache } from './cache'
import { Tools } from './tools'

export class ContextAction {
  public resource: string
  public response: string
  public template: string
  public method: string
  public expects: Object
  public mappings: Object[]

  constructor(values = {}) {
    each(values, (value, key) => {
      this[key] = value
    })
  }
}

export class ContextMemberAction extends ContextAction {}
export class ContextCollectionAction extends ContextAction {}

export interface ContextProperty {
  collection: boolean
  exportable: boolean
  readable: boolean
  writable: boolean
  isAssociation: boolean
  type: string
  required?: boolean
  validations?: any[]
}

export class Context {
  ready: Promise<Context>
  data: any

  static get(contextUrl: string) {
    let key = first(contextUrl.split('?'))

    let cachedContext
    if (cachedContext = Cache.runtime.get(key)){
      return cachedContext
    }

    let dataPromise
    let cachedData
    if (!Tools.isNode && (cachedData = Cache.storage.get(key))) {
      dataPromise = Promise.resolve(cachedData)
    }
    else {
      dataPromise = new Promise((resolve, reject) => {
        var req = Tools.req
          .get(contextUrl)
          .query({ t: Config.timestamp })

        if (Config.getSessionId()) {
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

        req
          .end((err, res) => {
            if (err) {
              var error = Tools.errorResult(err, res)

              if (Config.errorInterceptor) {
                // if error interceptor returns true, then abort (don't resolve nor reject)
                if (Config.errorInterceptor(error)) return
              }

              return reject(error)
            }

            return resolve(res.body)
          })
      })
    }

    if (!Tools.isNode) {
      dataPromise.then((data) => {
        return Cache.storage.set(key, data)
      })
    }

    cachedContext = new Context(dataPromise)
    Cache.runtime.set(key, cachedContext)
    return cachedContext
  }

  constructor(dataPromise) {
    this.ready = dataPromise.then((data) => {
      this.data = data

      each(this.properties, function(property, name) {
        property.isAssociation = property.type && /^(http|https)\:/.test(property.type)
      })

      return this
    })
  }

  get context() {
    return this.data && this.data['@context'] || {}
  }

  get id() {
    return this.context['@id']
  }

  get properties() {
    return this.context.properties || {}
  }

  get constants() {
    return this.context.constants || {}
  }

  property(name: string): ContextProperty {
    return this.properties[name]
  }

  constant(name: string) {
    return this.constants[name]
  }

  association(name: string): ContextProperty {
    var property = this.property(name)
    return property.isAssociation && property
  }

  memberAction(name: string): ContextMemberAction {
    var action = this.context && this.context.member_actions && this.context.member_actions[name]

    if (!action) {
      console.log(`requested non-existing member action ${name}`)
      return
    }

    return new ContextMemberAction(action)
  }

  collectionAction(name: string): ContextCollectionAction {
    var action = this.context && this.context.collection_actions && this.context.collection_actions[name]

    if (!action) {
      console.log(`requested non-existing collection action ${name}`)
      return
    }

    return new ContextCollectionAction(action)
  }
}
