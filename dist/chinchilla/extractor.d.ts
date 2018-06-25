import { Context, ContextAction } from './context';
export declare class Extractor {
    static extractMemberParams(context: Context, obj: any): Object;
    static extractCollectionParams(context: Context, obj: any): Object;
    static uriParams(action: ContextAction, params?: {}): Object;
    private static extractParams;
    private static extractValues;
    private static extractArrayValues;
}
