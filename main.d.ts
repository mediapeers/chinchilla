declare module Chinchilla {
    class ContextOperation extends Operation {
        parent: Operation;
        subject: any;
        constructor(parent: any, subject: any);
    }
}
declare module Chinchilla {
    class Context {
    }
}
declare var _: any;
declare var Promise: any;
declare module Chinchilla {
    class Operation {
        $context: Context;
        $contextUrl: string;
        $subject: any;
        $error: any;
        $deferred: any;
        $promise: any;
        $associationProperty: any;
        $associationData: any;
        $associationType: any;
        constructor();
        $(subject: any): void;
        $$(action: any, params?: {}, options?: {}): void;
        $c(action: any, params?: {}, options?: {}): void;
        $m(action: any, params?: {}, options?: {}): void;
        private _findContextUrl(subject);
    }
}
declare var _: any;
declare var Promise: any;
declare module Chinchilla {
    class Session {
        private static _instance;
        constructor();
        static getInstance(): Session;
        getSessionId(): string;
    }
}
declare module Chinchilla {
    class RequestBuilder {
        $context: Context;
        $subject: any;
        $type: string;
        $actionName: string;
        $options: any;
        constructor(context: any, subject: any, type: any, actionName: any, options?: {});
    }
}
declare var _: any;
declare var Promise: any;
declare module Chinchilla {
    class ActionOperation extends Operation {
        $parent: Operation;
        $type: string;
        $action: string;
        $params: any;
        $options: any;
        $arr: any[];
        $obj: any;
        $graph: any[];
        $headers: any;
        $response: any;
        constructor(parent: any, type: any, action: string, params?: {}, options?: {});
        $objects(): any[];
        private _run();
        private _moveAssociations();
        private _initLazyLoading();
        private _buildGraph();
    }
}
