const getFieldNames = require('@orbiting/graphql-list-fields')

const { Roles: { ensureUserHasRole } } =
  require('@orbiting/backend-modules-auth')

const { getDocumentId } =
  require('@orbiting/backend-modules-search/lib/Documents')

const { graphql: { resolvers: { queries: { documents: getDocuments } } } } =
  require('@orbiting/backend-modules-documents')

const { getRepos, tagNormalizer } = require('../../../lib/github')

const {
  commit: getCommit,
  meta: getMeta
} = require('../Repo')
const { document: getDocument } = require('../Commit')

const hasFieldRequested = (fieldName, GraphQLResolveInfo) => {
  const fields = getFieldNames(GraphQLResolveInfo)

  return !!fields.find(field => field.indexOf(`.${fieldName}`) > -1)
}

const {
  GITHUB_LOGIN,
  REPOS_NAME_FILTER
} = process.env

module.exports = async (__, args, context, info) => {
  ensureUserHasRole(context.user, 'editor')

  const {
    pageInfo,
    totalCount,
    totalDiskUsage,
    repositories
  } = await getRepos(args)

  // List of document IDs, referenced in repo.latestPublications
  const documentIds = []

  let repos = await Promise.all(
    repositories
      // skip uninitialized repos
      .filter(repository => repository.defaultBranchRef)
      // filter repo names
      .filter(repository =>
        !REPOS_NAME_FILTER || !!REPOS_NAME_FILTER.split(',').find(name => repository.name.indexOf(name) > -1)
      )
      .map(async (repository) => {
        const repo = {
          ...repository,
          id: `${GITHUB_LOGIN}/${repository.name}`
        }

        const latestCommit = await getCommit(
          repo,
          { id: repo.defaultBranchRef.target.oid },
          context
        )

        const document = await getDocument(
          latestCommit,
          { publicAssets: true },
          context
        )

        return {
          ...repo,
          meta: await getMeta(repo),
          latestCommit: {
            ...latestCommit,
            document
          },
          latestPublications: [
            { refName: 'publication', ref: repo.publication },
            { refName: 'prepublication', ref: repo.prepublication },
            { refName: 'scheduled-publication', ref: repo.scheduledPublication },
            { refName: 'scheduled-prepublication', ref: repo.scheduledPrepublication }
          ]
            .filter(pub => pub.ref && pub.ref.target)
            .map(pub => tagNormalizer(pub.ref.target, repo.id, pub.refName))
            .map(pub => {
              documentIds.push(
                getDocumentId({
                  repoId: pub.repo.id,
                  commitId: pub.commit.id,
                  versionName: pub.name
                })
              )

              return pub
            })
        }
      })
  )

  if (info && hasFieldRequested('document', info)) {
    // Find all documents reference in latestPublications
    const publicationDocumentsConnection =
      await getDocuments(
        __,
        { first: documentIds.length, ids: documentIds },
        context
      )

    // Add document to each corresponding publication
    repos = repos.map(repo => ({
      ...repo,
      latestPublications:
        repo.latestPublications.map(publication => ({
          ...publication,
          document:
            publicationDocumentsConnection.nodes.find(node => {
              return node.id === getDocumentId({
                repoId: publication.repo.id,
                commitId: publication.commit.id,
                versionName: publication.name
              })
            })
        }))
    }))
  }

  return {
    nodes: repos,
    pageInfo,
    totalCount,
    totalDiskUsage
  }
}
