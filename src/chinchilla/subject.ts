import { clone, isArray, map, isPlainObject, isString, merge, first, each, isEmpty } from 'lodash'
import { Context } from './context'
import { Config } from './config'
import { Action } from './action'
import { Extractor } from './extractor'
import { Association } from './association'
import { Cache } from './cache'
import { Tools } from './tools'

export class Subject {
  subject: any // the object(s) we deal with
  contextUrl: string
  id: string
  config: Config
  _context: Context

  static detachFromSubject(objects: any) {
    var detach = function(object) {
      var copy = clone(object)
      delete copy['$subject']
      return copy
    }

    if (isArray(objects)) {
      return map(objects, detach)
    }
    else if (isPlainObject(objects)) {
      return detach(objects)
    }

    return objects
  }

  constructor(one: string|any, two?: string|Config, three?: Config) {
    this.id = Cache.random('subject')

    if (isString(one)) {
      // one -> app, two -> model, three -> config
      if (isEmpty(two) || !isString(two)) throw new Error("chinchilla: missing 'model' param")
      if (Tools.isNode && isEmpty(three)) throw new Error("chinchilla: missing 'config' param (in NodeJs context)")

      this.config = three || Config.getInstance()
      this.contextUrl = `${this.config.settings.endpoints[one]}/context/${two}`
    }
    else {
      // one -> object(s), two -> config
      if (Tools.isNode && isEmpty(two)) throw new Error("chinchilla: missing 'config' param (in NodeJs context)")

      this.config = two as Config || Config.getInstance()
      isArray(one) ? this.addObjects(one) : this.addObject(one)
    }
  }

  memberAction(name: string, inputParams?: any, options?: any): Promise<any> {
    var promise
    return promise = this.context.ready.then((context) => {
      var contextAction = context.memberAction(name)
      var mergedParams  = merge({}, this.objectParams, inputParams)

      var action = new Action(contextAction, mergedParams, this.subject, this.config, options)
      promise['$objects'] = action.result.objects

      return action.ready
    })
  }

  // alias
  $m(...args) {
    return this.memberAction.apply(this, args)
  }

  collectionAction(name: string, inputParams: any, options?: any): Promise<any> {
    return this.context.ready.then((context) => {
      var contextAction = context.collectionAction(name)
      var mergedParams  = merge({}, this.objectParams, inputParams)

      return new Action(contextAction, mergedParams, this.subject, this.config, options).ready
    })
  }

  // alias
  $c(...args) {
    return this.collectionAction.apply(this, args)
  }

  $$(...args) {
    if (this.subject && isArray(this.subject)) {
      return this.collectionAction.apply(this, args)
    }
    else {
      return this.memberAction.apply(this, args)
    }
  }

  // returns Association that resolves to a Result where the objects might belong to different Subjects
  association(name: string): Association {
    return Association.get(this, name, this.config)
  }

  // can be used to easily instantiate a new object with given context like this
  //
  // chch('um', 'user').new(first_name: 'Peter')
  new(attrs = {}) {
    this.subject = merge(
      { '@context' : this.contextUrl, '$subject': this.id },
      attrs
    )

    return this
  }

  get context(): Context {
    if (this._context) return this._context
    return this._context = Context.get(this.contextUrl, this.config)
  }

  get objects() {
    return isArray(this.subject) ? this.subject : [this.subject]
  }
  get object(): Object {
    return isArray(this.subject) ? first(this.subject) : this.subject
  }

  get objectParams(): Object {
    return Extractor.extractMemberParams(this.context, this.objects)
  }

  destroy() {
    each(this.objects, (object) => {
      for (var key in object) {
        delete object[key];
      }
    });

    for (var key in this) {
      delete this[key];
    }
  }

  private addObjects(objects: any[]): void {
    this.subject = []
    each(objects, (obj) => {
      obj.$subject = this.id
      this.moveAssociationReferences(obj)
      this.initAssociationGetters(obj)
      this.subject.push(obj)
    })

    this.contextUrl = this.object['@context']
  }

  private addObject(object: any): void {
    object.$subject = this.id
    this.moveAssociationReferences(object)
    this.initAssociationGetters(object)

    this.contextUrl = object['@context']
    this.subject    = object
  }

  private moveAssociationReferences(object: any): void {
    if (!object.$associations) object.$associations = {}

    var key
    for (key in object) {
      if (!object.hasOwnProperty(key)) continue

      var value = object[key]

      if (key === '$associations') continue

      if (isArray(value)) {
        var el = first(value)
        if (isPlainObject(el) && el['@id']) {
          // HABTM
          object.$associations[key] = clone(value)
          delete object[key]
        }
      }
      else if (isPlainObject(value) && value['@id']) {
        object.$associations[key] = clone(value)
        delete object[key]
      }
    }
  }

  private initAssociationGetters(object: any): void {
    if (!object.$associations) return

    each(object.$associations, (_value, key) => {
      Object.defineProperty(object, key, {
        get: () => {
          return this.association(key).getDataFor(object)
        }
      })
      Object.defineProperty(object, `${key}Promise`, {
        get: () => {
          return this.association(key).ready
        }
      })
    })
  }
}
