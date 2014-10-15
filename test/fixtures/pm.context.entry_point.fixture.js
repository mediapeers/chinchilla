defineFixture('pm.context.entry_point', {
  "@context" : {
    "constants" : {  },
    "@type" : "http://pm.mpx.dev/v20140601/context/context",
    "properties": {
      "affiliation" : {
        "type" : "http://pm.mpx.dev/v20140601/context/affiliation",
        "collection": false
      },
      "products" : {
        "type" : "http://pm.mpx.dev/v20140601/context/product",
        "collection": true
      }
    }
  }
});
