import { each, first, isEmpty } from 'lodash'
import * as request from 'superagent'
import { Config } from './config'
import { Cache } from './cache'

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
  context: any
  id: string
  properties: any
  constants: any

  static get(contextUrl: string): Context {
    let key = first(contextUrl.split('?'))
    let cached

    if (cached = Cache.get(key)) {
      return cached
    }
    else {
      let context = new Context(contextUrl)
      Cache.add(key, context)
      return context
    }
  }

  constructor(contextUrl: string) {
    this.ready = new Promise((resolve, reject) => {
      var req = request
        .get(contextUrl)
        .query({ t: Config.timestamp })

      if (Config.getAffiliationId()) {
        req = req.set('Affiliation-Id', Config.getAffiliationId())
      }
      if (Config.getSessionId()) {
        req = req.set('Session-Id', Config.getSessionId())
      }

      req
        .end((err, res) => {
          this.data       = res.body
          this.context    = res.body && res.body['@context'] || {}
          this.id         = this.context['@id']
          this.properties = this.context.properties || {}
          this.constants  = this.context.constants || {}

          each(this.properties, function(property, name) {
            property.isAssociation = property.type && /^(http|https)\:/.test(property.type)
          })

          resolve(this)
        })
    })
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
