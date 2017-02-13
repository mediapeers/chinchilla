/// <reference path = "../../typings/promise.d.ts" />
declare var _;
declare var Cookies;

module Chinchilla {
  export class Config {
    static endpoints = {};
    static timestamp = Date.now() / 1000 | 0;
    static domain: string;
    static sessionId: string;
    static sessionKey = 'chinchillaSessionId';
    static errorInterceptor: any;

    // timestamp to be appended to every request
    // will be the same for a session lifetime
    
    static setEndpoint(name: string, url: string): void {
      Config.endpoints[name] = url;
    }

    static setCookieDomain(domain: string): void {
      Config.domain = domain; 
    }

    static setSessionId(id: string): void {
      Cookies.set(Config.sessionKey, id, { path: '/', domain: Config.domain, expires: 300});
    }

    static setErrorInterceptor(fn) {
      Config.errorInterceptor = fn;
    }

    static getSessionId(): string {
      return Cookies.get(Config.sessionKey);
    }

    static clearSessionId(): void {
      Cookies.remove(Config.sessionKey, { domain: Config.domain });
    }
  }
}
