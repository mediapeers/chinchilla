/// <reference path="../typings/uri-templates.d.ts" />
/// <reference path="foo.d.ts" />
declare module Chinchilla {
    class Session {
        domain: string;
        opts: Object;
        setSessionDomain(domain: string): void;
    }
}
