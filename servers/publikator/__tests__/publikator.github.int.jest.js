const { Instance } = require('@orbiting/backend-modules-test')

const {
  Users
} = require('@orbiting/backend-modules-auth/__tests__/auth')
const {
  deleteRepos,
  getArticleMdFromGithub
} = require('./helpers')
const {
  SIMPLE_REPOS_QUERY,
  REPO_QUERY,
  commit
} = require('./graphqlQueries.js')
const docs = require('./documents')

beforeAll(async () => {
  await Instance.init({ serverName: 'publikator' })
  await deleteRepos()
}, 1000 * 60 * 5)

afterAll(async () => {
  await global.instance.closeAndCleanup()
}, 60000)

beforeEach(async () => {
  const { pgdb } = global.instance.context

  await pgdb.public.discussions.truncate({ cascade: true })
  await pgdb.public.sessions.truncate({ cascade: true })

  global.instance.apolloFetch = global.instance.createApolloFetch()
  global.testUser = null
})

const tr = (...args) => global.instance.context.t(...args)

const getRepoId = (name) => {
  const { GITHUB_LOGIN } = process.env
  return `${GITHUB_LOGIN}/${name}`
}

describe('auth', () => {
  test('unauthorized repos query', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    const result = await apolloFetch({
      query: SIMPLE_REPOS_QUERY
    })
    expect(result.data).toBe(null)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].message).toBe(tr('api/signIn'))
  })

  test('repos (signed in, without role)', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    global.testUser = {
      email: 'alice.smith@test.project-r.construction',
      roles: [ ]
    }
    const result = await apolloFetch({
      query: SIMPLE_REPOS_QUERY
    })
    expect(result.data).toBe(null)
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].message).toBe(tr('api/unauthorized', { role: 'editor' }))
  })

  test('repos (signed in)', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    global.testUser = Users.Editor
    const result = await apolloFetch({
      query: SIMPLE_REPOS_QUERY
    })
    expect(result.data).toBeTruthy()
    expect(result.data.repos).toBeTruthy()
    expect(result.data.repos.nodes).toBeTruthy()
    expect(result.data.repos.nodes.length).toBe(0)
    expect(result.errors).toBeFalsy()
  })
})

// repo get specifig commit, invalid commit
// commit null parent on existing repo denied, parent on non existing denied

// placeMilestone, removeMilestone

// publish

describe('workflow', () => {
  const user = Users.Editor
  let repoId
  let commit0Id
  let commit2Id

  beforeAll(() => {
    repoId = getRepoId('article-postschiff')
  })
  beforeEach(() => {
    global.testUser = Users.Editor
  })
  afterAll(() => {
    global.testUser = null
  })

  test('create', async () => {
    const result = await commit({
      variables: {
        repoId,
        parentId: null,
        message: 'init',
        document: docs.postschiff[0].preCommit
      },
      user
    })

    // check returned doc
    expect(result.data.commit.document).toMatchSnapshot({
      id: expect.any(String)
    })

    // check article.md on github
    const articleMd = await getArticleMdFromGithub(repoId)
    expect(articleMd).toMatchSnapshot()

    commit0Id = result.data.commit.id
  })

  test('edit', async () => {
    const result = await commit({
      variables: {
        repoId,
        parentId: commit0Id,
        message: 'edit',
        document: docs.postschiff[1].preCommit
      },
      user
    })

    // check returned doc
    expect(result.data.commit.document).toMatchSnapshot({
      id: expect.any(String)
    })

    // check article.md on github
    const articleMd = await getArticleMdFromGithub(repoId)
    expect(articleMd).toMatchSnapshot()
  })

  test('autobranching', async () => {
    const result = await commit({
      variables: {
        repoId,
        parentId: commit0Id,
        message: 'autobranching',
        document: docs.postschiff[2].preCommit
      },
      user
    })

    // check returned doc
    expect(result.data.commit.document).toMatchSnapshot({
      id: expect.any(String)
    })

    // check article.md on github
    const articleMd = await getArticleMdFromGithub(repoId)
    expect(articleMd).toMatchSnapshot()

    commit2Id = result.data.commit.id
  })

  test('get, numCommits, latestCommit', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    const result = await apolloFetch({
      query: REPO_QUERY,
      variables: {
        repoId
      }
    })
    expect(result.errors).toBeFalsy()
    expect(result.data).toBeTruthy()
    expect(result.data.repo).toBeTruthy()
    expect(result.data.repo.commits).toBeTruthy()
    expect(result.data.repo.commits.nodes).toBeTruthy()
    expect(result.data.repo.commits.nodes.length).toBe(3)
    expect(result.data.repo.latestCommit).toBeTruthy()
    expect(result.data.repo.latestCommit.id).toBe(commit2Id)
  })
})
