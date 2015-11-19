/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "action_operation.ts" />
/// <reference path = "context_operation.ts" />
/// <reference path = "context.ts" />
declare var _;

module Chinchilla {
  export class Operation {
    $context: Context;
    $contextUrl: string;
    $subject: any;
    $error: any;
    $deferred: Deferred<Operation>;
    $promise: Thenable<Operation>;
    $associationProperty: any;
    $associationData: any;
    $associationType: any;

    constructor() {
      new Promise<Operation>(function(resolve, reject) {
        resolve('foo'); 
      });
      this.$error = {};
      this.$deferred = <Deferred<Operation>>Promise.pending();
      this.$promise = this.$deferred.promise;
    }

    $(subject) {
      new ContextOperation(this, subject);
    }

    $$(action, params = {}, options = {}) {
      new ActionOperation(this, null, action, params, options);
    }

    $c(action, params = {}, options = {}) {
      new ActionOperation(this, 'collection', action, params, options); 
    }

    $m(action, params = {}, options = {}) {
      new ActionOperation(this, 'member', action, params, options); 
    }

    private _findContextUrl(subject): void {
      if (_.isString(subject)) {
        this.$contextUrl = this.$associationProperty && this.$associationProperty.type

        if (!this.$contextUrl) throw new Error(`Chinchilla.Operation#_findContextUrl: no association '${subject}' found`);
      }
      else if (_.isArray(subject)) {
        var first = _.first(subject);
        this.$contextUrl = first && first['@context'];
        
        if (!this.$contextUrl) throw new Error('Chinchilla.Operation#_findContextUrl: empty array of objects given or missing context');
      }
      else if (_.isPlainObject(subject)) {
        this.$contextUrl = subject['@context'];

        if (!this.$contextUrl) throw new Error('Chinchilla.Operation#_findContextUrl: missing context');
      }
      else {
        throw new Error('Chinchilla.Operation#_findContextUrl: unsupported subject');
      }
    }
  }
}
