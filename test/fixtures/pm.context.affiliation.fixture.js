defineFixture('pm.context.affiliation', {
  "@context": {
    "@type": "http://pm.mpx.dev/v20140601/context/affiliation",
    "properties": {
      "id": {
        "type": "string"
      }
    },
    "member_actions": {
      "get": {
        "method": "GET",
        "expects": null,
        "response": "http://pm.mpx.dev/v20140601/context/affiliation",
        "resource": "http://pm.mpx.dev/v20140601/context/affiliation",
        "template": "http://pm.mpx.dev/v20140601/affiliation"
      }
    }
  }
});
