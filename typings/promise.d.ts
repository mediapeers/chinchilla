// declaration file for bluebird

declare class Promise<R> {
  static pending(): Deferred<any>;
  static all(promises: Promise<any>[]): Promise<any>;

  then(onResolve?: (value: R) => void): Promise<R>;
  then(onResolve?: (value: R) => void, onReject?: (error?: any) => void): Promise<R>;
  catch(onReject?: (error?: any) => void): Promise<R>;

  constructor(callback: (resolve: (thenableOrResult: R | Promise<R>) => void, reject: (error: any) => void) => void)
}

interface Deferred<R> {
  promise: Promise<R>;
  reject(error?: any): void;
  resolve(value: R): void;
}
