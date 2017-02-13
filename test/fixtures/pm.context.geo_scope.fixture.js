defineFixture('pm.context.geo_scope', {
  "@context": {
    "@type": "context",
    "constants": {},
    "properties": {
      "id": {
        "type": "number"
      },
      "name": {
        "type": "string"
      }
    },
    "member_actions": {},
    "collection_actions": {
      "query": {
        "method": "GET",
        "expects": null,
        "response": "http://pm.mpx.dev/v20140601/context/collection",
        "resource": "http://pm.mpx.dev/v20140601/context/geo_scope",
        "template": "http://pm.mpx.dev/v20140601/geo_scopes/graph",
        "mappings": []
      },
      "graph": {
        "method": "GET",
        "expects": null,
        "response": "http://pm.mpx.dev/v20140601/context/collection",
        "resource": "http://pm.mpx.dev/v20140601/context/geo_scope",
        "template": "http://pm.mpx.dev/v20140601/geo_scopes/graph",
        "mappings": []
      }
    }
  }
});
