/// <reference path = "context.ts" />
/// <reference path = "action.ts" />
/// <reference path = "extractor.ts" />
/// <reference path = "association.ts" />
declare var _;

module Chinchilla {
  export class Subject {
    objects: any[];
    contextUrl: string;
    id: string;
    _context: Context;

    constructor(objects: any) {
      // unique id for this instance (for cache key purpose)
      this.id = Math.random().toString(36).substr(2, 9);

      // adds and initializes objects to this Subject
      _.isArray(objects) ? this.addObjects(objects) : this.addObjects([objects]);
    }

    memberAction(name: string, inputParams: any): Promise<Context> {
      var promise;
      return promise = this.context.ready.then((context) => {
        var contextAction = context.memberAction(name);
        var mergedParams  = _.merge({}, this.extractedParams, inputParams);
        var uriParams     = Extractor.uriParams(contextAction, mergedParams);

        var action = new Action(contextAction.template, uriParams, this.object);
        promise['$objects'] = action.result.objects;

        return action.ready;
      });
    }

    collectionAction(name: string, inputParams: any): Promise<Context> {
      return this.context.ready.then((context) => {
        var contextAction = context.collectionAction(name);
        var mergedParams  = _.merge({}, this.extractedParams, inputParams);
        var uriParams     = Extractor.uriParams(contextAction, mergedParams);

        return new Action(contextAction.template, uriParams, this.objects);
      });
    }

    // returns Association that resolves to a Result where the objects might belong to different Subjects
    association(name: string): Association {
      return Association.get(this, name);
    }

    get context(): Context {
      if (this._context) return this._context;
      return this._context = new Context(this.contextUrl);
    }

    get object(): Object {
      return _.first(this.objects);
    }

    get extractedParams(): Object {
      return Extractor.extractMemberParams(this.context, this.objects);
    }

    private addObjects(objects: any[]): void {
      this.objects = [];
      _.each(objects, (obj) => {
        obj.$subject = this;
        this.moveAssociationReferences(obj);
        this.initAssociationGetters(obj);
        this.objects.push(obj);
      });

      this.contextUrl = this.object['@context'];
    }

    private moveAssociationReferences(object: any): void {
      object.$associations = {};

      _.each(object, (value, key) => {
        if (key === '$associations') return; 

        var el;
        if (_.isArray(value) && (el = _.first(value) && _.isPlainObject(el) && el['@id'])) {
          // HABTM
          object.$associations[key] = _.clone(value);
          delete object[key];
        }
        else if (_.isPlainObject(value) && value['@id']) {
          object.$associations[key] = _.clone(value);
          delete object[key];
        }
        return true;
      });
    }

    private initAssociationGetters(object: any): void {
      if (!object.$associations) return;

      _.each(object.$associations, (value, key) => {
        var promiseKey = `${key}Promise`;

        Object.defineProperty(object, key, {
          get: () => {
            this.association(key).getDataFor(object);
          }
        });
        Object.defineProperty(object, `${key}Promise`, {
          get: () => {
            this.association(key).ready;
          }
        });
      });
    }
  }
}

// new Chinchilla.Subject(object).memberAction('delete') => Chinchilla.Result
// new Chinchilla.Context('um', 'user').memberAction('get', { id: 3 }) => Chinchilla.Subject
//
// var userSubject = new Chinchilla.Context('um', 'user').memberAction('get', { id: 3})
//
// var user;
// userSubject.onResolve((c) => user = c; )
// 
// var organizationSubject = user.organization (== user.association('organization').content)
//
// result groups objects by context, instantiates a new subject for every group
// result initializes lazy loading on objects, pointing to this group's subject#association method
//
// var users = [];
//
// new Chinchilla.Subject(users).association('organization') => Chinchilla.Result
//
// 
