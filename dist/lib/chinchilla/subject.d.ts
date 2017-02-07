import { Context } from './context';
import { Association } from './association';
export declare class Subject {
    subject: any;
    contextUrl: string;
    id: string;
    _context: Context;
    static detachFromSubject(objects: any): any;
    constructor(objectsOrApp: any, model?: string);
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
