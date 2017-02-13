/// <reference path="../typings/promise.d.ts" />
/// <reference path="../typings/uriTemplate.d.ts" />
declare var _: any;
declare var Cookies: any;
declare module Chinchilla {
    class Config {
        static endpoints: {};
        static timestamp: number;
        static domain: string;
        static sessionId: string;
        static sessionKey: string;
        static errorInterceptor: any;
        static setEndpoint(name: string, url: string): void;
        static setCookieDomain(domain: string): void;
        static setSessionId(id: string): void;
        static setErrorInterceptor(fn: any): void;
        static getSessionId(): string;
        static clearSessionId(): void;
    }
}
declare var _: any;
declare var request: any;
declare module Chinchilla {
    class ContextAction {
        resource: string;
        response: string;
        template: string;
        method: string;
        expects: Object;
        mappings: Object[];
        constructor(values?: {});
    }
    class ContextMemberAction extends ContextAction {
    }
    class ContextCollectionAction extends ContextAction {
    }
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
    class Context {
        static cache: {};
        ready: Promise<Context>;
        data: any;
        context: any;
        id: string;
        properties: any;
        constants: any;
        static get(contextUrl: string): Context;
        constructor(contextUrl: string);
        property(name: string): ContextProperty;
        constant(name: string): any;
        association(name: string): ContextProperty;
        memberAction(name: string): ContextMemberAction;
        collectionAction(name: string): ContextCollectionAction;
    }
}
declare var _: any;
declare module Chinchilla {
    class Result {
        headers: any;
        aggregations: any;
        objects: any[];
        objects_raw: any[];
        success(result: any): void;
        readonly object: any;
    }
    class ErrorResult extends Error {
        headers: any;
        object: any;
        stack: any;
        statusCode: number;
        statusText: string;
        url: string;
        method: string;
        constructor(message: any);
        error(result: any): this;
    }
}
declare var _: any;
declare module Chinchilla {
    class Extractor {
        static extractMemberParams(context: Context, obj: any): Object;
        static extractCollectionParams(context: Context, obj: any): Object;
        static uriParams(action: ContextAction, params?: {}): Object;
        private static extractParams(contextAction, obj);
        private static extractValues(contextAction, object);
        private static extractArrayValues(contextAction, objects);
    }
}
declare var _: any;
declare var request: any;
declare module Chinchilla {
    class Action {
        ready: Promise<Result>;
        params: Object;
        options: any;
        body: Object;
        uriTmpl: UriTemplate;
        contextAction: ContextAction;
        result: Result;
        constructor(contextAction: ContextAction, params: {}, body: any, options?: any);
        private formatBody(body);
        private cleanupObject(object);
        private remapAttributes(object);
    }
}
declare var _: any;
declare module Chinchilla {
    class Cache {
        private static instance;
        private cacheSize;
        private cache;
        constructor();
        static getInstance(): Cache;
        static generateKey(type: string): string;
        add(key: string, obj: any): void;
        get(key: string): any;
        private capCache();
        private static sliceCache(arr, size);
    }
}
declare var _: any;
declare module Chinchilla {
    class Association {
        subject: Subject;
        name: string;
        ready: Promise<Context>;
        associationData: any;
        habtm: boolean;
        context: Context;
        associationProperty: ContextProperty;
        cache: Object;
        constructor(subject: Subject, name: string);
        static get(subject: Subject, name: string): any;
        destroy(): void;
        getDataFor(object: Object): any;
        private fillCache(result);
        private readonly associationParams;
        private readAssociationData();
    }
}
declare var _: any;
declare module Chinchilla {
    class Subject {
        subject: any;
        contextUrl: string;
        id: string;
        _context: Context;
        static detachFromSubject(objects: any): any;
        constructor(objectsOrApp: any, model?: string);
        destroy(): void;
        memberAction(name: string, inputParams?: any, options?: any): Promise<Context>;
        $m(...args: any[]): any;
        collectionAction(name: string, inputParams: any, options?: any): Promise<Context>;
        $c(...args: any[]): any;
        $$(...args: any[]): any;
        association(name: string): Association;
        new(attrs?: {}): this;
        readonly context: Context;
        readonly objects: any;
        readonly object: Object;
        readonly objectParams: Object;
        private addObjects(objects);
        private addObject(object);
        private moveAssociationReferences(object);
        private initAssociationGetters(object);
    }
}
