/// <reference path = "operation.ts" />

module Chinchilla {
  export class ContextOperation extends Operation {
    parent: Operation;
    subject: any;

    constructor(parent = null, subject) {
      this.parent = parent;
      this.subject = subject;

      super();
    } 
  }
}
