/// <reference path = "subject.ts" />
declare var _;

module Chinchilla {
  export class Result {
    headers: any;
    aggregations: any;
    objects: any[] = [];
    objects_raw: any[] = [];

    success(result): void {
      this.headers  = result.headers;
      if (result.body && result.body.aggregations) this.aggregations = result.body.aggregations;

      switch (result.body && result.body['@type']) {
        case 'graph':
          var members = result.body['@graph'];
          if (!members) return;

          this.objects_raw = members;

          new Subject(members);

          _.each(members, (node) => {
            if (node.parent_id) {
              // this is a child
              var parent = _.find(members, (x) => {
                return x.id === node.parent_id;
              });
              if (parent) {
                node.parent = parent;
                if (!parent.children) parent.children = [];
                parent.children.push(node);
              }
              return true; // continue loop
            }
            else {
              // root
              this.objects.push(node);
            }
          });
          break;

        case 'collection':
        case 'search_collection':
          _.each(result.body.members, (member) => {
            this.objects.push(member);
          })

          var byContext = _.groupBy(this.objects, '@context');

          // creates new Subject for each group ob objects that share the same @context
          _.each(byContext, (objects, context) => {
            new Subject(objects);
          });
          break;

        default:
          if (_.isArray(result.body)) throw new Error("Unexpectedly got an array");
          if (_.isEmpty(result.body)) break;
          this.objects.push(result.body);
          new Subject(this.object);
          break;
      }
    }

    get object() {
      return _.first(this.objects);
    }
  }

  export class ErrorResult extends Error {
    headers: any;
    object: any;
    stack: any;
    statusCode: number;
    statusText: string;
    url: string;
    method: string;

    constructor(message) {
      super(message);
    }

    error(result) {
      this.headers    = result.headers;
      this.object     = result.body;
      this.statusCode = result.statusCode;
      this.statusText = result.statusText;
      this.url        = result.req.url;
      this.method     = result.req.method;
      return this;
    }
  }
}
