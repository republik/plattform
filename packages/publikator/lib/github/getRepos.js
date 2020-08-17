const { lib: { clients: createGithubClients } } = require('@orbiting/backend-modules-github')

const {
  GITHUB_LOGIN
} = process.env

const fragments = `
fragment LatestPublicationProbs on Ref {
  name
  target {
    ... on Tag {
      name
      message
      oid
      author: tagger {
        name
        email
        date
      }
      commit: target {
        ... on Commit {
          id: oid
        }
      }
    }
  }
}
fragment Repo on Repository {
  name
  createdAt
  updatedAt
  isArchived
  defaultBranchRef {
    target {
      ... on Commit {
        oid
      }
    }
  }
  metaTag: ref(qualifiedName: "refs/tags/meta") {
    target {
      ... on Tag {
        message
      }
    }
  }
  tags: refs(refPrefix: "refs/tags/", first: 100) {
    nodes {
      name
    }
  }
  publication: ref(qualifiedName: "refs/tags/publication") {
    ...LatestPublicationProbs
  }
  prepublication: ref(qualifiedName: "refs/tags/prepublication") {
    ...LatestPublicationProbs
  }
  scheduledPublication: ref(qualifiedName: "refs/tags/scheduled-publication") {
    ...LatestPublicationProbs
  }
  scheduledPrepublication: ref(qualifiedName: "refs/tags/scheduled-prepublication") {
    ...LatestPublicationProbs
  }
}
`

// TK: Once GraphQL supports code results
// https://platform.github.community/t/how-to-search-code-using-graphql/1906
// const searchQuery = ({search, ...args}) => ({
//   query: `
//     ${fragments}
//     query repositories(
//       $query: String!
//       $first: Int
//       $last: Int
//       $before: String
//       $after: String
//     ) {
//       search(
//         type: REPOSITORY,
//         first: $first,
//         last: $last,
//         before: $before,
//         after: $after,
//         query: $query
//       ) {
//         repositoryCount
//         pageInfo {
//           endCursor
//           hasNextPage
//           hasPreviousPage
//           startCursor
//         }
//         nodes {
//           ...on Repository {
//             ...Repo
//           }
//         }
//       }
//     }
//   `,
//   variables: {
//     ...args,
//     query: `org:${GITHUB_LOGIN} ${search}`
//   }
// })

const listQuery = args => ({
  query: `
    ${fragments}
    query repositories(
      $login: String!
      $first: Int
      $last: Int
      $before: String
      $after: String
      $orderBy: RepositoryOrder
    ) {
      repositoryOwner(login: $login) {
        repositories(
          first: $first,
          last: $last,
          before: $before,
          after: $after,
          orderBy: $orderBy
        ) {
          pageInfo {
            endCursor,
            hasNextPage,
            hasPreviousPage,
            startCursor
          }
          totalCount
          totalDiskUsage
          nodes {
            ...Repo
          }
        }
      }
    }
  `,
  variables: {
    ...args,
    login: GITHUB_LOGIN
  }
})

const nameQuery = repoNames => ({
  query: `
    ${fragments}
    query repositories(
      $login: String!
    ) {
      repositoryOwner(login: $login) {
        ${repoNames.map((repoName, i) => `
          r${i}: repository(name: "${repoName}") {
            ...Repo
          }
        `)}
      }
    }
  `,
  variables: {
    login: GITHUB_LOGIN
  }
})

module.exports = {
  getRepos: async (args) => {
    const { githubApolloFetch, githubRest } = await createGithubClients()

    if (args.search) {
      if (args.orderBy) {
        throw new Error('getRepos: orderBy not supported when searching')
      }
      // TK: Remove once GraphQL supports code results
      if (args.before || args.after || args.last) {
        throw new Error('getRepos: pagination not supported when searching')
      }

      const search = await githubRest.search.code({
        q: `org:${GITHUB_LOGIN} ${args.search}`,
        per_page: args.first
      })

      const searchResultRepos = search.data.items
        .map(item => item.repository)
        .filter((a, index, all) => index === all.findIndex(b => a.id === b.id))

      let repositories = []

      if (searchResultRepos.length) {
        const {
          data: {
            repositoryOwner
          }
        } = await githubApolloFetch(nameQuery(searchResultRepos.map(repo => repo.name)))

        repositories = searchResultRepos.map((_, i) => repositoryOwner[`r${i}`])
      }

      // TK: Once GraphQL supports code results
      // const {
      //   data: {
      //     search: {
      //       pageInfo,
      //       repositoryCount: totalCount,
      //       nodes: repositories
      //     }
      //   }
      // } = await githubApolloFetch(searchQuery(args))

      return {
        pageInfo: {
          hasPreviousPage: false,
          hasNextPage: false
        },
        totalCount: repositories.length,
        repositories
      }
    }

    const {
      data: {
        repositoryOwner: {
          repositories: {
            pageInfo,
            totalCount,
            totalDiskUsage,
            nodes: repositories
          }
        }
      }
    } = await githubApolloFetch(listQuery(args))

    return {
      pageInfo,
      totalCount,
      totalDiskUsage,
      repositories
    }
  }
}
