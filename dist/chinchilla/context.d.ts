import * as Promise from 'bluebird';
export declare class ContextAction {
    resource: string;
    response: string;
    template: string;
    method: string;
    expects: Object;
    mappings: Object[];
    constructor(values?: {});
}
export declare class ContextMemberAction extends ContextAction {
}
export declare class ContextCollectionAction extends ContextAction {
}
export interface ContextProperty {
    collection: boolean;
    exportable: boolean;
    readable: boolean;
    writable: boolean;
    isAssociation: boolean;
    type: string;
    required?: boolean;
    validations?: any[];
}
export declare class Context {
    static cache: {};
    ready: Promise<Context>;
    data: any;
    static get(contextUrl: string): any;
    constructor(dataPromise: any);
    readonly context: any;
    readonly id: any;
    readonly properties: any;
    readonly constants: any;
    property(name: string): ContextProperty;
    constant(name: string): any;
    association(name: string): ContextProperty;
    memberAction(name: string): ContextMemberAction;
    collectionAction(name: string): ContextCollectionAction;
}
