import { Subject } from './subject';
import { Config } from './config';
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
    constructor(subject: Subject, name: string, config: Config);
    static get(subject: Subject, name: string, config?: Config): any;
    getDataFor(object: Object): any;
    private fillCache;
    private readonly associationParams;
    private readAssociationData;
}
