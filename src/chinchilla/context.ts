import { each, first } from 'lodash'
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

  static get(contextUrl: string, config: Config) {
    config = config
    let key = first(contextUrl.split('?'))

    let cachedContext
    if (cachedContext = Cache.runtime.fetch(config.getCacheKey(key))) {
      return cachedContext
    }

    let dataPromise
    let cachedData
    if (!config.settings.devMode && !Tools.isNode && (cachedData = Cache.storage.fetch(config.getCacheKey(key)))) {
      dataPromise = Promise.resolve(cachedData)
    }
    else {
      dataPromise = new Promise((resolve, reject) => {
        var req = Tools.req
          .get(contextUrl)
          .query({ t: config.settings.timestamp })

        if (config.getSessionId()) {
          req = req.set('Session-Id', config.getSessionId())
        }
        if (config.getAffiliationId()) {
          req = req.set('Affiliation-Id', config.getAffiliationId())
        }
        if (config.getRoleId()) {
          req = req.set('Role-Id', config.getRoleId())
        }
        if (config.getFlavours()) {
          req = req.set('Mpx-Flavours', config.getFlavours())
        }

        req
          .end((err, res) => {
            if (err) {
              const [handled, error] = Tools.handleError(err, res, config)
              return handled ? null : reject(error)
            }

            return resolve(res.body)
          })
      })
    }

    cachedContext = new Context(dataPromise)

    // when running a node web server, for multiple simultaneous requests of the same context
    // one could fail (e.g. with a 419). for this reason we cache only after a successful result
    // to avoid other users by coincidence get returned an error
    if (Tools.isNode) {
      dataPromise.then((_data) => {
        return Cache.runtime.put(config.getCacheKey(key), cachedContext)
      })
    }
    else {
      if (!config.settings.devMode) {
        dataPromise.then((data) => {
          return Cache.storage.put(config.getCacheKey(key), data)
        })
      }

      Cache.runtime.put(config.getCacheKey(key), cachedContext)
    }

    return cachedContext
  }

  constructor(dataPromise) {
    this.ready = dataPromise.then((data) => {
      this.data = data

      each(this.properties, function(property) {
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
