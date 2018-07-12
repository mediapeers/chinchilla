import { Context } from './context';
import { Config } from './config';
import { Association } from './association';
export declare class Subject {
    subject: any;
    contextUrl: string;
    id: string;
    config: Config;
    _context: Context;
    static detachFromSubject(objects: any): any;
    constructor(objectsOrApp: any, model?: string, config?: Config);
    memberAction(name: string, inputParams?: any, options?: any): Promise<any>;
    $m(...args: any[]): any;
    collectionAction(name: string, inputParams: any, options?: any): Promise<any>;
    $c(...args: any[]): any;
    $$(...args: any[]): any;
    association(name: string): Association;
    new(attrs?: {}): this;
    readonly context: Context;
    readonly objects: any;
    readonly object: Object;
    readonly objectParams: Object;
    destroy(): void;
    private addObjects;
    private addObject;
    private moveAssociationReferences;
    private initAssociationGetters;
}
