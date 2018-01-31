import * as request from 'superagent'
//import * as sdebug from 'superdebug'
//import * as http from 'http'

export class Tools {
  static get isNode() {
    return typeof window === 'undefined'
  }

  static get req() {
    if (Tools.isNode) {
      //const agent = new http.Agent()
      //agent.maxSockets = 100

      return request
        .agent()
        //.use(sdebug(console.info))
        .set({ "Accept-Encoding" : "gzip,deflate" })
    }
    else {
      return request
    }
  }
}
