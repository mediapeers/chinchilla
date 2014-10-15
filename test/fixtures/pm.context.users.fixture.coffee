defineFixture('pm.context.product', {
  "@context": {
    "@type": "http://pm.mpx.dev/v20140601/context/product",
    "constants": {
        "access_levels": [
            "private",
            "company",
            "viewable",
            "accessible"
        ],
        "types": [
            "product/motion_picture/format",
            "product/motion_picture/program",
            "product/motion_picture/series",
            "product/motion_picture/season",
            "product/motion_picture/episode"
        ]
    },
    "properties": {
      "id": {
        "type": "number"
      },
      "access_level": {
        "type": "string"
      },
      "display_title": {
        "type": "string"
      },
      "affiliation": {
        "type": "http://pm.mpx.dev/v20140601/context/affiliation",
        "collection": false
      },
      "layers": {
        "type": "http://pm.mpx.dev/v20140601/context/layer",
        "collection": true
      }
    },
    "member_actions": {
      "show": {
        "method": "GET",
        "expects": null,
        "response": "http://pm.mpx.dev/v20140601/context/product",
        "resource": "http://pm.mpx.dev/v20140601/context/product",
        "template": "http://pm.mpx.dev/v20140601/product/{product_id}",
        "mappings": [
          {
            "variable": "product_id",
            "source": "id",
            "required": true
          }
        ]
      }
    },
    "collection_actions": {
      "create": {
        "method": "POST",
        "expects": "http://pm.mpx.dev/v20140601/context/product",
        "response": "http://pm.mpx.dev/v20140601/context/product",
        "resource": "http://pm.mpx.dev/v20140601/context/product",
        "template": "http://um.mpx.com/v20140601/products",
        "mappings": []
      },
      "query": {
        "method": "GET",
        "expects": null,
        "response": "http://pm.mpx.dev/v20140601/context/collection",
        "resource": "http://pm.mpx.dev/v20140601/context/product",
        "template": "http://pm.mpx.dev/v20140601/products{?ids}",
        "mappings": [
          {
            "variable": "ids",
            "source": "id"
          }
        ]
      }
    }
  }
});
