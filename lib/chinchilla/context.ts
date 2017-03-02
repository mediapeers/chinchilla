import { each, first, isEmpty } from 'lodash'
import * as superagent from 'superagent'
import * as use from 'superagent-use'
import * as logger from 'superagent-logger'
import { Config } from './config'

const request = use(superagent)

if (typeof window === 'undefined')
  request.use(logger({ outgoing: true }))

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
  static cache = {}

  ready: Promise<Context>
  data: any
  context: any
  id: string
  properties: any
  constants: any

  static get(contextUrl: string): Context {
    var key = first(contextUrl.split('?'))
    var cached

    if (cached = Context.cache[key]) {
      return cached
    }
    else {
      return Context.cache[key] = new Context(contextUrl)
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
