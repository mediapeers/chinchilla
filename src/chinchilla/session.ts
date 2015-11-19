declare var _:any;
declare var Promise:any;
declare var JSCookieThing:any;

module Chinchilla {
  export class Session {
    private static _instance:Session = new Session();

    constructor() {
      if (Session._instance) throw new Error('Error: Instantiation failed. Use Session.getInstance() instead');

      Session._instance = this;
    }

    public static getInstance(): Session {
      return Session._instance;
    }

    public getSessionId(): string {
      // TODO: implement
      return 'foo';
    }
  }
}
