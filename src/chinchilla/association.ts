/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "subject.ts" />
/// <reference path = "action.ts" />
/// <reference path = "extractor.ts" />
/// <reference path = "context.ts" />
/// <reference path = "utils.ts" />
/// <reference path = "cache.ts" />
declare var _;

module Chinchilla {
  export class Association {
    subject: Subject;
    name: string;
    ready: Promise<Context>;
    associationData: any;
    habtm: boolean = false;
    context: Context;
    associationProperty: ContextProperty;

    // this cache contains the association data for each of the subject's objects
    cache: Object = {};

    constructor(subject: Subject, name: string) {
      this.subject          = subject;
      this.name             = name;
      this.associationData  = this.readAssociationData();

      // array of arrays => HABTM!
      this.habtm = _.isArray(_.first(this.associationData));
      if (this.habtm) this.associationData = _.flatten(this.associationData);

      this.ready = this.subject.context.ready.then((context) => {
        this.associationProperty = context.association(name);

        return Context.get(this.associationProperty.type).ready.then((associationContext) => {
          this.context = associationContext;

          var contextAction = this.associationData.length > 1 || this.associationProperty.collection ?
            associationContext.collectionAction('get') :
            associationContext.memberAction('get');

          if (!contextAction) throw new Error(`could not load association ${name}`);

          //var extractedParams = Extractor.extractCollectionParams(this.subject.context, this.subject.objects);
          //TODO is ^^ this needed?

          return new Action(contextAction, this.associationParams, {}).ready.then((result) => {
            this.fillCache(result);
            return result;
          });
        });
      });
    }

    // instances of Association get cached for every Subject. this means for any Subject the association data
    // is loaded only once. however it is possible to have multiple Subjects containing the same objects and each of
    // them loads their associations individually
    static get(subject: Subject, name: string) {
      var key = `association-${subject.id}-${name}`;

      var instance;
      if (instance = Cache.getInstance().get(key)) {
        return instance;
      }
      else {
        instance = new Association(subject, name);
        Cache.getInstance().add(key, instance);

        return instance;
      }
    }

    destroy() {
      for (var key in this) {
        delete this[key];
      }
    }

    getDataFor(object: Object) {
      var key = object && object['@id'];
      if (!key) return;

      if (this.associationProperty && this.associationProperty.collection && !this.cache[key]) {
        return this.cache[key] = [];
      }

      return this.cache[key];
    }

    // after association data has been retrieved this function sorts result data into cache where the cache key
    // if the parent (subject's) objects id
    private fillCache(result: Result): void {
      if (this.associationProperty.collection) {
        if (this.habtm) {
          // HAS AND BELONGS TO MANY
          var sorted = {};
          _.each(result.objects, (obj) => {
            sorted[obj['@id']] = obj;
          });


          _.each(this.subject.objects, (obj) => {
            var key = obj['@id'];
            this.cache[key] = [];

            var references = obj.$associations && obj.$associations[this.name];
            if (!_.isArray(references)) return true;

            _.each(references, (reference) => {
              var result = sorted[reference['@id']];
              if (!result) return true;

              this.cache[key].push(result);
            });
          });
        }
        else {
          // HAS MANY
          // find back reference association, -> association that points to same context the parent context does
          // say you want to load user phones..
          // - @$operation is a user action operation, which $context is the user context
          // - @contextOperation.$context is the phone context
          // - -> find the association inside of phone context which points to @id of user context
          // 1. attempt: try to find association name using parent context id in own associations
          var associationName;
          associationName = _.findKey(this.context.properties, (value, key) => {
            return value && value.type && value.type === this.subject.context.id;
          });

          // 2. attempt: try to find association name using inverse_of if given
          if (!associationName) {
            associationName = _.findKey(this.context.properties, (value, key) => {
              return value && value.inverse_of && value.inverse_of === this.name;
            });
          }

          _.each(result.objects, (obj) => {
            var backReference = obj && obj.$associations && obj.$associations[associationName] && obj.$associations[associationName]['@id'];
            if (!backReference) return;

            if (!this.cache[backReference]) this.cache[backReference] = [];
            this.cache[backReference].push(obj);
          });
        }
      }
      else {
        // HAS ONE / BELONGS TO
        var sorted = {};
        _.each(result.objects, (obj) => {
          sorted[obj['@id']] = obj;
        });

        _.each(this.subject.objects, (obj) => {
          var requestedId = obj.$associations && obj.$associations[this.name] && obj.$associations[this.name]['@id'];
          if (!requestedId) return;

          var result = sorted[requestedId];
          if (!result) return;

          this.cache[obj['@id']] = result;
        });
      }
    }

    private get associationParams() {
      if (this.habtm) {
        return Extractor.extractMemberParams(this.context, _.flatten(this.associationData));
      }
      else if (this.associationProperty.collection) {
        return Extractor.extractCollectionParams(this.context, this.associationData);
      }
      else {
        return Extractor.extractMemberParams(this.context, this.associationData);
      }
    }

    // extract reference data from parent objects
    private readAssociationData() {
      var name = this.name;

      var assocData = function(obj) {
        return obj && obj.$associations && obj.$associations[name];
      }

      return _.map(this.subject.objects, function(obj) {
        return assocData(obj);
      });
    }
  }
}
