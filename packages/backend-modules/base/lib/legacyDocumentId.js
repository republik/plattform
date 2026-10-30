// Legacy publikator document ids: a plain `<org>/<repoName>` repoId, or the
// base64 of `<org>/<repoName>/<commitId>/<versionName>`. Clients still hold
// both in bookmarks, subscriptions and progress, so inputs have to keep being
// understood until those are gone. Lives here, in a leaf package, so the
// packages that need it don't have to depend on each other.
const getParsedDocumentId = (id) => {
  const base64Buffer = Buffer.from(id, 'base64')
  const isBase64 = base64Buffer.toString('base64') === id

  if (!isBase64) {
    // id is repoId
    const [org, repoName] = id.split('/')
    return {
      repoId: id,
      org,
      repoName,
    }
  }

  // decoded = <org>/<repoName>/<commitId>/<versionName>
  //                 ^^^^^^^^^^
  const decoded = base64Buffer.toString('utf8')

  const [org, repoName, commitId, versionName] = decoded.split('/')

  return {
    repoName,
    org,
    repoId: repoName && org && `${org}/${repoName}`,
    commitId,
    versionName,
  }
}

module.exports = { getParsedDocumentId }
