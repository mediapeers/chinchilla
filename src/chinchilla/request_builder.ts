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
    }
  }
}
