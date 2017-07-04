import { clone, isArray, map, isPlainObject, isString, merge, first, each } from 'lodash'
import { Context } from './context'
import { Config } from './config'
import { Action } from './action'
import { Extractor } from './extractor'
import { Association } from './association'
import { Cache } from './cache'

export class Subject {
  subject: any // the object(s) we deal with
  contextUrl: string
  id: string
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

  constructor(objectsOrApp: any, model?: string) {
    this.id = Cache.generateRandomKey('subject')

    // adds and initializes objects to this Subject
    if (isString(objectsOrApp)) {
      this.contextUrl = `${Config.endpoints[objectsOrApp]}/context/${model}`
    }
    else {
      isArray(objectsOrApp) ? this.addObjects(objectsOrApp) : this.addObject(objectsOrApp)
    }

    /* disabled for now
    Cache.add(this.id, this)
    */
  }

  memberAction(name: string, inputParams?: any, options?: any): Promise<any> {
    var promise
    return promise = this.context.ready.then((context) => {
      var contextAction = context.memberAction(name)
      var mergedParams  = merge({}, this.objectParams, inputParams)

      var action = new Action(contextAction, mergedParams, this.subject, options)
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

      return new Action(contextAction, mergedParams, this.subject, options).ready
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
    return Association.get(this, name)
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
    return this._context = Context.get(this.contextUrl)
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

    each(object.$associations, (value, key) => {
      var promiseKey = `${key}Promise`

      Object.defineProperty(object, key, {
        get: () => {
          return this.association(key).getDataFor(object)
        },
        set: (parent) => { object.parent = parent },
        configurable: key === 'parent'
      })
      Object.defineProperty(object, `${key}Promise`, {
        get: () => {
          return this.association(key).ready
        }
      })
    })
  }
}
