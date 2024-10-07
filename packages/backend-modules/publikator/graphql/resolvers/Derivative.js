


module.exports = {
  commit: async (derivative, args, context) => {
    if (!(derivative?.commitId)) {
      throw new Error('Could not find commit the derivative %s was generated from', derivative.id)
    }
    const dbCommit = await context.loaders.Commit.byId.load(derivative.commitId)
    return dbCommit
  }
}
