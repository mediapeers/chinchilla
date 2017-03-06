export declare class Result {
    type: string;
    headers: any;
    aggregations: any;
    objects: any[];
    objects_raw: any[];
    success(result: any): void;
    readonly object: any;
}
export declare class ErrorResult extends Error {
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
