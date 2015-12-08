/// <reference path = "subject.ts" />
declare var _;

module Chinchilla {
  export class Result {
    headers: any;
    data: any;
    objects: any[] = [];

    success(result): void {
      this.headers  = result.headers;
      this.data     = (result.body && result.body.members) || result.body;

      switch (result.body['@type']) {
        case 'graph':
          var members = result.body['@graph'];
          if (!members) return;

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
          this.objects.push(result.body);
          new Subject(this.objects);
          break;
      }
    }

    get object() {
      return _.first(this.objects);
    }
  }
}
