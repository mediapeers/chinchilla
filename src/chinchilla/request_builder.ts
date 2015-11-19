/// <reference path = "context.ts" />

module Chinchilla {
  export class RequestBuilder {
    $context: Context;
    $subject: any;
    $type: string;
    $actionName: string;
    $options: any;

    constructor(context, subject, type, actionName, options = {}) {
      this.$context = context;
      this.$subject = subject;
      this.$type = type;
      this.$actionName = actionName;
      this.$options = options;

      this.$mergedParams = {}

      if (this.$type === 'collection') {
        this.$action = this.$context.collection_action(this.$actionName)
      } else {
        this.$context.member_action(this.$actionName)
      }
    }
  }
}
