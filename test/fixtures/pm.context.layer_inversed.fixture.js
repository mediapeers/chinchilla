defineFixture('pm.context.layer_inversed', {
  "@context": {
    "@id": "http://pm.mpx.dev/v20140601/context/layer/standard",
    "@type": "context",
    "constants": {},
    "properties": {
      "id": {
        "type": "number"
      },
      "product": {
        "type": "http://pm.mpx.dev/v20140601/context/product",
        "inverse_of": "layers",
        "collection": false
      }
    },
    "member_actions": { },
    "collection_actions": {
      "query": {
        "method": "GET",
        "expects": null,
        "response": "http://pm.mpx.dev/v20140601/context/layer",
        "resource": "http://pm.mpx.dev/v20140601/context/layer",
        "template": "http://pm.mpx.dev/v20140601/products/{product_ids}/layers{?ids}",
        "mappings": [
          {
            "variable": "ids",
            "source": "id",
            "required": false
          },
          {
            "variable": "product_ids",
            "source": "product_id",
            "required": true
          }
        ]
      },
      "get": {
        "method": "GET",
        "expects": null,
        "response": "http://pm.mpx.dev/v20140601/context/layer",
        "resource": "http://pm.mpx.dev/v20140601/context/layer",
        "template": "http://pm.mpx.dev/v20140601/products/{product_ids}/layers/{ids}",
        "mappings": [
          {
            "variable": "ids",
            "source": "id",
            "required": true
          },
          {
            "variable": "product_ids",
            "source": "product_id",
            "required": true
          }
        ]
      }
    }
  }
});
