const getDocuments = require('./_queries/documents')

module.exports = {
  document: async (zone, _args, context, info) => {
    const { repoId, commitId } = zone

    return getDocuments(
      undefined,
      { first: 1, repoId, commitId },
      context,
      info,
    ).then((docCon) => docCon.nodes[0])
  },
}
