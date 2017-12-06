const supervillains = require('supervillains')

const getNewRepoId = () =>
  `test-${supervillains.random()}`.replace(/\s/g, '-')

const {
    GITHUB_LOGIN
  } = process.env

const repos = [
  {
    id: `${GITHUB_LOGIN}/${getNewRepoId()}`,
    documentMeta: {
      format: 'format1'
    },
    milestones: [
      'milestone0'
    ],
    repoMeta: {
      productionDeadline: '2017-12-03T17:00:00.000Z'
    }
  },
  {
    id: `${GITHUB_LOGIN}/${getNewRepoId()}`,
    documentMeta: {
      format: 'format1',
      publishDate: '2017-12-11T17:00:00.000Z'
    },
    milestones: [
      'milestone0',
      'milestone1'
    ],
    repoMeta: {
      creationDeadline: '2017-12-02T17:00:00.000Z',
      productionDeadline: '2017-12-02T17:00:00.000Z'
    }
  },
  {
    id: `${GITHUB_LOGIN}/${getNewRepoId()}`,
    documentMeta: {
      publishDate: '2017-12-12T17:00:00.000Z'
    },
    milestones: [ ],
    repoMeta: {
      creationDeadline: '2017-12-03T17:00:00.000Z'
    }
  }
]

const miniMdast = {
  type: 'root',
  meta: { },
  children: [
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: 'Oetra, lacinia lorem in, dignissim sem.'
        }
      ]
    }
  ]
}

module.exports = async (t, apolloFetch, githubRest) => {
  for (let repo of repos) {
    const variables = {
      repoId: repo.id,
      message: 'test commit',
      content: {
        ...miniMdast,
        meta: {
          ...miniMdast.meta,
          ...repo.documentMeta
        }
      }
    }
    const resultCommit = await apolloFetch({
      query: `
        mutation commit(
          $repoId: ID!
          $message: String!
          $content: JSON!
        ){
          commit(
            repoId: $repoId
            message: $message
            document: {
              content: $content
            }
          ) {
            id
            repo {
              id
            }
          }
        }
      `,
      variables
    })
    t.ok(resultCommit.data)
    t.equals(resultCommit.data.commit.repo.id, variables.repoId)
    const commitId = resultCommit.data.commit.id

    for (let milestoneName of repo.milestones) {
      const milestoneVariables = {
        repoId: repo.id,
        commitId,
        name: milestoneName,
        message: 'nothingofimportance.'
      }
      const resultMilestone = await apolloFetch({
        query: `
            mutation placeMilestone(
              $repoId: ID!
              $commitId: ID!
              $name: String!
              $message: String!
            ){
              placeMilestone(
                repoId: $repoId
                commitId: $commitId
                name: $name
                message: $message
              ) {
                name
              }
            }
          `,
        variables: milestoneVariables
      })
      t.ok(resultMilestone.data)
      t.equals(resultMilestone.data.placeMilestone.name, milestoneVariables.name)
    }

    if (repo.repoMeta) {
      const metaVariables = {
        repoId: repo.id,
        ...repo.repoMeta
      }
      const resultMeta = await apolloFetch({
        query: `
            mutation editRepoMeta(
              $repoId: ID!
              $creationDeadline: DateTime
              $productionDeadline: DateTime
            ){
              editRepoMeta(
                repoId: $repoId
                creationDeadline: $creationDeadline
                productionDeadline: $productionDeadline
              ) {
                id
              }
            }
          `,
        variables: metaVariables
      })
      t.ok(resultMeta.data)
    }
  }

  console.log('test repos without params')
  let result
  result = await apolloFetch({
    query: `
      {
        repos {
          nodes {
            id
          }
        }
      }
      `
  })
  t.ok(result.data)

  console.log('test repos orderBy PUSHED_AT ASC')
  result = await apolloFetch({
    query: `
      {
        repos(
          orderBy: {
            field: PUSHED_AT
            direction: ASC
          }
        ) {
          nodes {
            id
          }
        }
      }
      `
  })
  t.ok(result.data)
  {
    // TODO remove filter when tests run in an isolated github org
    const _repos = result.data.repos.nodes.filter(repo => repos.find(r => r.id === repo.id))
    t.equals(_repos[0].id, repos[0].id)
    t.equals(_repos[1].id, repos[1].id)
    t.equals(_repos[2].id, repos[2].id)
  }

  console.log('test repos orderBy PUSHED_AT DESC')
  result = await apolloFetch({
    query: `
      {
        repos(
          orderBy: {
            field: PUSHED_AT
            direction: DESC
          }
        ) {
          nodes {
            id
          }
        }
      }
      `
  })
  t.ok(result.data)
  {
    const _repos = result.data.repos.nodes.filter(repo => repos.find(r => r.id === repo.id))
    t.equals(_repos[0].id, repos[2].id)
    t.equals(_repos[1].id, repos[1].id)
    t.equals(_repos[2].id, repos[0].id)
  }

  // cleanup
  for (let _repo of repos) {
    const [owner, repo] = _repo.id.split('/')
    await githubRest.repos.delete({
      owner,
      repo
    })
  }
}
