/// <reference path = "operation.ts" />
/// <reference path = "session.ts" />
/// <reference path = "request_builder.ts" />
declare var _:any;
declare var Promise:any;

module Chinchilla {
  export class ActionOperation extends Operation {
    $parent: Operation;

    $type: string;
    $action: string;
    $params: any;
    $options: any;

    $arr: any[];
    $obj: any;
    $graph: any[];
    $headers: any;
    $response: any;

    constructor(parent, type, action:string, params = {}, options = {}) {
      super();

      this.$parent = parent;
      this.$type = type;
      this.$action = action;
      this.$params = params;
      this.$options = options;
      
      if (!this.$options.withoutSession) {
        this.$options.http = {
          'headers': {
            'Session-Id': Session.getInstance().getSessionId()
          }
        }
      }

      this.$parent.$promise
        .then(() => {
          this.$context = this.$parent.$context;
          this.$associationData = this.$parent.$associationData;
          this.$associationProperty = this.$parent.$associationProperty;
          this.$associationType = (this.$associationProperty && this.$associationProperty.collection) ? 'collection' : 'member';

          if (_.isNull(this.$type)) {
            // if type is not specified, try to guess from association
            if (_.isArray(this.$associationData) || _.isArray(this.$parent.$subject)) {
              this.$type = 'collection';
            }
            else if (_.isPlainObject(this.$associationType)) {
              this.$type = 'member';
            }
            else {
              this.$type = this.$associationType;
            }
          }

          this._run();
        })
        .catch(() => {
          this.$deferred.reject();
        })
    } 

    $objects(): any[] {
      return _.isEmpty(this.$obj) ? this.$arr : [this.$obj];
    }

    private _run(): void {
      var builder = new RequestBuilder(this.$context, this.$subject, this.$type, this.$action, this.$options);

      // DISASSEMBLE params from association references if available..
      // if collection association and data array of arrays => HABTM!
      if (this.$type === 'collection' && _.isArray(this.$associationData) && _.isArray(_.first(this.$associationData))) {
        var flattenedAssociationData = _.flatten(this.$associationData);
        builder.extractFrom(flattenedAssociationData, 'member');
      }
      // if member association and data array => HABTM!
      else if (this.$type === 'member' && _.isArray(this.$associationData)) {
        builder.extractFrom(this.$associationData, 'member');
      }
      // can be member and single object or
      // collection and array
      else {
        builder.extractFrom(this.$associationData, this.$associationType);
      }

      // DISASSEMBLE params from passed objects
      builder.extractFrom(this.$subject, this.$type);
      // add passed params
      builder.mergeParams(this.$params);

      builder.performRequest
        .then((response) => {
          _.merge(this.$headers, response.headers()); 

          if (response.data['@type'] === 'graph') {
            _.each(response.data['@graph'], (member) => {
              this.$arr.push(member);
            });
          }
          else {
            var data = (response.data && response.data.members) || response.data;

            if (_.isArray(data)) {
              _.each(data, (member) => {
                this.$arr.push(member);
              });
            }
            else {
              _.merge(this.$obj, data);
            }

            this._moveAssociations();
            this._initLazyLoading();
          }
        })
        .catch((response) => {
          this.$response = response;
          this.$error = response.data;
          _.merge(this.$headers, response.headers());

          this.$deferred.reject(this);
        })
    }

    private _moveAssociations(): void {
      _.each(this.$objects(), function(object) {
        object.$associations = object.$associations || {}; 

        _.each(object, function(key, value) {
          if (key === '$associations') return;

          if ((_.isArray(value) && _.isPlainObject(_.first(value))) || (_.isPlainObject(value) && value['@id'])) {
            object.$associations[key] = _.clone(value);
            delete object[key];
          }
        });
      });
    }

    private _initLazyLoading(): void {
      var groups = _.groupBy(this.$objects(), '@context');
      var promises = [];

      _.each(groups, function(records, contextUrl) {
        var operation = new ObjectsOperation(records);
        operation.$promise.then(function() {
          new LazyLoader(operation, records);
        });

        promises.push(operation.$promise);
      });

      Promise.all(promises).then(() => {
        this.$deferred.resolve(this); 
      });
    }

    private _buildGraph(): void {
      if (_.isEmpty(this.$arr)) return;

      this.$graph = [];

      // id, parent_id tree builder
      _.each(this.$arr, (node) => {
        if (node.parent_id) {
          var parent = _.find(this.$arr, (x) => { x.id === node.parent_id });

          if (parent) {
            node.parent = parent;
            parent.children = parent.children || [];
            parent.children.push(node);
          }
          else {
            this.$graph.push(node);
          }
        } 
      });

      this.$deferred.resolve(this);
    }
  }
}
