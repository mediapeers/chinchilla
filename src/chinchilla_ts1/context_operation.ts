/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "operation.ts" />
/// <reference path = "action_operation.ts" />
declare var _;

module Chinchilla {
  export class ContextOperation extends Operation {
    constructor(parent:Operation = null, subject) {
      super();

      this.$parent = parent;
      this.$subject = subject;

      if (this.$parent) {
        this.$parent.$promise
          .then(() => {
            // when 'subject' is a string and there is a parent, we're talking about an association
            if (_.isString(this.$subject)) {
              this.$associationProperty = this.$parent.$context.association(this.$subject); 

              if (this.$parent instanceof ActionOperation) {
                var actionParent = <ActionOperation> this.$parent;

                // collect association references from parent if we have data..
                // this is required later for back referencing objects when we got data.
                var assocData = function(object) {
                  return object && object.$associations && object.$associations[this.$subject];
                };

                if (!_.isEmpty(actionParent.$arr)) {
                  this.$associationData = _.map(actionParent.$arr, function(member) { assocData(member); })
                }
                else {
                  this.$associationData = assocData(actionParent.$obj);
                }
              }
            }

            this._run();
          })
          .catch(() => {
            this.$deferred.reject();
          })
      }
      else {
        // no parent
        this._run();
      }
    } 

    // creates a new object pointing to the current context
    //
    // @param [Object] attrs attributes to be merged into the new object
    // @return [Object]
    $new(attrs = {}) {
      new Promise((resolve, reject) => {
      });
    }
  }
}
