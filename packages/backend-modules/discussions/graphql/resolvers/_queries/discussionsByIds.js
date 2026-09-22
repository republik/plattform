// Batch form of the `discussion(id:)` query, and like it deliberately has no
// role check: search results show comment counts to logged-out visitors, and
// callers can only resolve ids they already hold. (The arg-less `discussions`
// query is member-gated because it lists every discussion.) Hidden discussions
// resolve to null rather than leaking a count -- the same `hidden` flag
// `discussions` filters on. Resolves through the Discussion.byId DataLoader,
// so N ids cost one SQL query.
module.exports = async (_, { ids }, { loaders }) => {
  const discussions = await loaders.Discussion.byId.loadMany(ids)
  return discussions.map((discussion) =>
    discussion && !discussion.hidden ? discussion : null,
  )
}
