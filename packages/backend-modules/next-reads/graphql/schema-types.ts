export = `
type NextReadsResult {
  id: ID!
  documents: [Document!]!
}

"""
Sanity-only counterpart to NextReadsResult: returns document references
rather than resolved Documents (see SanityDocumentRef), since a next-reads
candidate has no mdast content to resolve -- the frontend fetches display
data from Sanity directly using the id.
"""
type NextReadsSanityResult {
  id: ID!
  documents: [SanityDocumentRef!]!
}
`
