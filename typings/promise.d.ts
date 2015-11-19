// declaration file for bluebird

declare class Promise<R> {
  static pending(): Deferred<any>;
  static all(promises: Thenable<any>[]): Thenable<any>;

  constructor(callback: (resolve: (thenableOrResult: R | Thenable<R>) => void, reject: (error: any) => void) => void)
}

interface Deferred<R> {
  promise: Thenable<R>;
  reject(error: any): void;
  resolve(value: R): void;
}

interface Thenable<R> {
  then(onResolve: (value: R) => void): Thenable<R>;
  then(onResolve: (value: R) => void, onReject: (error: any) => void): Thenable<R>;
  catch(onReject: (error: any) => void): Thenable<R>;
}
