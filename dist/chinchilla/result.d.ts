export declare class Result {
    static paginationProps: string[];
    type: string;
    headers: any;
    aggregations: any;
    body: any;
    objects: any[];
    pagination: any;
    success(result: any, raw?: boolean): void;
    readonly object: any;
}
