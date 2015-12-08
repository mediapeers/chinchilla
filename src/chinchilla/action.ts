/// <reference path = "../../typings/uriTemplate.d.ts" />
/// <reference path = "../../typings/promise.d.ts" />
/// <reference path = "config.ts" />
/// <reference path = "result.ts" />
/// <reference path = "context.ts" />

declare var _;
declare var request;

module Chinchilla {
  export class Action {
    ready: Promise<Result>;
    params: Object;
    body: Object;
    uriTmpl: UriTemplate;
    result: Result = new Result();

    constructor(uri: string, params = {}, body = {}) {
      this.uriTmpl  = new UriTemplate(uri);
      this.params   = params; 
      this.body     = body;

      // 2. remap params
      // 3. cleanup body
      // 4. merge params

      this.ready = new Promise((resolve, reject) => {
        // 5. do request
        // 6. on data resolve with Result
        var req = request
          .get(this.uriTmpl.fillFromObject(this.params))
          .query({ t: Config.timestamp })

        req = req.set('Session-Id', Config.getSessionId());

        req = req
          .end((err, res) => {
            if (err) {
              // TODO create error result
              return reject(this.result);
            }
            
            this.result.success(res);
            resolve(this.result);
          });
      });
    }

    private cleanupBody(): void {
    
    }
  }
}
