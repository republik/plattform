export = `
type SearchApiKey {
  # Scoped to the articles/comments/users collections, with no document
  # filter baked in -- just a short expiry (see lib/scopedKey.ts). Usable
  # directly against Typesense's search endpoint.
  key: String!
  expiresAt: DateTime!
}
`
