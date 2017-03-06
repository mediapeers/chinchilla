import { Subject } from './subject';
import { Context, ContextProperty } from './context';
export declare class Association {
    subject: Subject;
    name: string;
    ready: Promise<any>;
    associationData: any;
    habtm: boolean;
    context: Context;
    associationProperty: ContextProperty;
    cache: Object;
    static cache: {};
    constructor(subject: Subject, name: string);
    static get(subject: Subject, name: string): any;
    getDataFor(object: Object): any;
    private fillCache(result);
    private readonly associationParams;
    private readAssociationData();
}
