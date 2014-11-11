defineFixture('pm.graph.geo_scope', {
  "@id": "http://example.com/geo_scopes/graph",
  "@type": "graph",
  "@graph": [
    {
      "@id": "http://example.com/geo_scope/TRR",
      "@context": "http://example.com/context/geo_scope",
      "@type": "geo_scope",
      "id": "TRR",
      "name": "Terra",
      "parent_id": null
    },
    {
      "@id": "http://example.com/geo_scope/MARS",
      "@context": "http://example.com/context/geo_scope",
      "@type": "geo_scope",
      "id": "MARS",
      "name": "Mars",
      "parent_id": null
    },
    {
      "@id": "http://example.com/geo_scope/EUR",
      "@context": "http://example.com/context/geo_scope",
      "@type": "geo_scope",
      "id": "EUR",
      "name": "Europe",
      "parent_id": "TRR"
    },
    {
      "@id": "http://example.com/geo_scope/GER",
      "@context": "http://example.com/context/geo_scope",
      "@type": "geo_scope",
      "id": "GER",
      "name": "Germany",
      "parent_id": "EUR"
    },
    {
      "@id": "http://example.com/geo_scope/FRA",
      "@context": "http://example.com/context/geo_scope",
      "@type": "geo_scope",
      "id": "FRA",
      "name": "France",
      "parent_id": "EUR"
    },
    {
      "@id": "http://example.com/geo_scope/MDLR",
      "@context": "http://example.com/context/geo_scope",
      "@type": "geo_scope",
      "id": "MDLR",
      "name": "Madler",
      "parent_id": "MARS"
    },
    {
      "@id": "http://example.com/geo_scope/CASS",
      "@context": "http://example.com/context/geo_scope",
      "@type": "geo_scope",
      "id": "CASS",
      "name": "Cassini",
      "parent_id": "MDLR"
    }
  ]
})
