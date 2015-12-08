declare var _;

module Chinchilla {
  interface ContextAction {
    resource: string;
    response: string;
    template: string;
    expects?: any;
    mappings?: any[];
  }

  interface ContextMemberAction extends ContextAction {}
  interface ContextCollectionAction extends ContextAction {}

  interface ContextProperty {
    collection: boolean;
    exportable: boolean;
    readable: boolean;
    writable: boolean;
    isAssociation: boolean;
    type: string;
    required?: boolean;
    validations?: any[];
  }

  export class Context {
    data: any;
    context: any;
    properties: any;
    constants: any;

    constructor(data = {}) {
      this.data = data;        
      this.context = data && data['@context'] || {};
      this.properties = this.context.properties || {};
      this.constants = this.context.contants || {};

      _.each(this.properties, function(property, name) {
        property.isAssociation = property.type && /^(http|https)\:/.test(property.type);
      });
    }

    property(name: string): ContextProperty {
      return this.properties[name];
    }

    constant(name: string) {
      return this.constants[name];
    }

    association(name: string): ContextProperty {
      var property = this.property(name);
      return property.isAssociation && property;
    }

    member_action(name: string): ContextMemberAction|void {
      var action = this.context && this.context.member_actions && this.context.member_actions[name];

      if (!action) {
        console.log(`requested non-existing member action ${name}`);
      }

      return action;
    }

    collection_action(name: string): ContextCollectionAction|void {
      var action = this.context && this.context.collection_actions && this.context.collection_actions[name];

      if (!action) {
        console.log(`requested non-existing collection action ${name}`);
      }

      return action;
    }
  }
}
