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
