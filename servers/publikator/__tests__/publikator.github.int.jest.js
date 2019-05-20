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
  REPO_COMMIT_QUERY,
  COMMIT_MUTATION,
  commit,
  placeMilestone,
  checkMilestone,
  REPO_MILESTONES_QUERY,
  REMOVE_MILESTONE_MUTATION,
  PUBLISH_MUTAION,
  UNPUBLISH_MUTAION,
  getLatestPublications,
  getDocuments,
  getDocument,
  getRefs
} = require('./graphqlQueries.js')
const docs = require('./documents')
const _ = require('lodash')
const moment = require('moment')
const sleep = require('await-sleep')

beforeAll(async () => {
  await Instance.init({ serverName: 'publikator', publicationScheduler: true })
  await deleteRepos()
}, 1000 * 60 * 2)

afterAll(async () => {
  await global.instance.closeAndCleanup()
  await deleteRepos()
}, 60000)

const tr = (...args) => global.instance.context.t(...args)

const getRepoId = (name) => {
  const { GITHUB_LOGIN } = process.env
  return `${GITHUB_LOGIN}/${name}`
}

describe('auth', () => {
  beforeEach(async () => {
    global.instance.apolloFetch = global.instance.createApolloFetch()
    global.testUser = null
  })

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

describe('workflow', () => {
  const user = Users.Editor
  let repoId
  let commit0Id
  let commit2Id

  beforeAll(async () => {
    repoId = getRepoId('article-postschiff')
    // insert user, used by milestone resolver
    const { pgdb } = global.instance.context
    await pgdb.public.users.insert(Users.Editor)
  })
  beforeEach(() => {
    global.testUser = Users.Editor
  })
  afterAll(async () => {
    const { pgdb } = global.instance.context
    await pgdb.public.users.truncate({ cascade: true })
    global.testUser = null
    await deleteRepos()
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

  test('get repo, numCommits, latestCommit', async () => {
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

  test('create and remove milestone', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    const variables = {
      repoId,
      commitId: commit0Id,
      name: 'test stone',
      message: 'test 1, 2, 3'
    }
    await placeMilestone({
      variables,
      user
    })
    const queryResult = await apolloFetch({
      query: REPO_MILESTONES_QUERY,
      variables: {
        repoId
      }
    })
    expect(queryResult.errors).toBeFalsy()
    expect(queryResult.data).toBeTruthy()
    expect(queryResult.data.repo.milestones).toBeTruthy()
    expect(queryResult.data.repo.milestones.length).toBe(1)
    checkMilestone({
      milestone: queryResult.data.repo.milestones[0],
      variables,
      user
    })

    // remove
    const removeResult = await apolloFetch({
      query: REMOVE_MILESTONE_MUTATION,
      variables: {
        ...variables,
        name: variables.name.replace(' ', '-')
      }
    })
    expect(removeResult.errors).toBeFalsy()
    expect(removeResult.data).toBeTruthy()
    expect(removeResult.data.removeMilestone).toBe(true)

    const query1Result = await apolloFetch({
      query: REPO_MILESTONES_QUERY,
      variables: {
        repoId
      }
    })
    expect(query1Result.errors).toBeFalsy()
    expect(query1Result.data).toBeTruthy()
    expect(query1Result.data.repo.milestones).toBeTruthy()
    expect(query1Result.data.repo.milestones.length).toBe(0)
  })

  test('get commit', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    const result = await apolloFetch({
      query: REPO_COMMIT_QUERY,
      variables: {
        repoId,
        commitId: commit0Id
      }
    })
    expect(result.errors).toBeFalsy()
    expect(result.data).toBeTruthy()
    expect(result.data.repo).toBeTruthy()
    expect(result.data.repo.commit).toBeTruthy()
    expect(result.data.repo.commit.id).toBe(commit0Id)
  })

  test('get invalid commit', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    const result = await apolloFetch({
      query: REPO_COMMIT_QUERY,
      variables: {
        repoId,
        commitId: '7366d36cb967d7a3ac324c789a8b718e61d01b31'
      }
    })
    expect(result.data).toBe(null)
    expect(result.errors).toBeTruthy()
  })

  test('commit without parentId to existing repo must fail', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    const result = await apolloFetch({
      query: COMMIT_MUTATION,
      variables: {
        repoId,
        parentId: null,
        message: 'fail',
        document: docs.postschiff[0].preCommit
      }
    })
    expect(result.data).toBe(null)
    expect(result.errors).toBeTruthy()
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].message).toBe(tr('api/commit/parentId/required', { repoId }))
  })

  test('commit with parentId to not existing repo must fail', async () => {
    const apolloFetch = global.instance.createApolloFetch()
    const result = await apolloFetch({
      query: COMMIT_MUTATION,
      variables: {
        repoId: getRepoId('test-test-test'),
        parentId: '7366d36cb967d7a3ac324c789a8b718e61d01b31',
        message: 'fail',
        document: docs.postschiff[0].preCommit
      }
    })
    expect(result.data).toBe(null)
    expect(result.errors).toBeTruthy()
    expect(result.errors.length).toBe(1)
    expect(result.errors[0].message).toBe(tr('api/commit/parentId/notAllowed', { repoId: getRepoId('test-test-test') }))
  })
})

describe('publish', () => {
  let repoId
  let commits
  let publishHistory = {}
  let apolloFetch
  const timeout = 1000 * 30

  beforeAll(async () => {
    await deleteRepos()

    const { pgdb } = global.instance.context
    await pgdb.public.users.insert(Users.Editor)
    await pgdb.public.users.insert(Users.Member)
    global.testUser = Users.Editor

    await initRepo()
  }, 1000 * 60)

  beforeEach(async () => {
    global.instance.apolloFetch = global.instance.createApolloFetch()
  })

  afterAll(async () => {
    global.testUser = null
    const { pgdb } = global.instance.context
    await pgdb.public.users.truncate({ cascade: true })
    await deleteRepos()
  })

  const initRepo = async () => {
    apolloFetch = global.instance.createApolloFetch()
    repoId = getRepoId('article-publications')
    commits = [
      {
        id: null,
        doc: docs.postschiff[0].preCommit
      },
      {
        id: null,
        doc: docs.postschiff[1].preCommit
      },
      {
        id: null,
        doc: docs.postschiff[2].preCommit
      },
      {
        id: null,
        doc: docs.postschiff[3].preCommit
      }
    ]
    for (const [i, c] of commits.entries()) {
      const result = await commit({
        variables: {
          repoId,
          parentId: i < 1 ? null : commits[i - 1].id,
          message: `commit ${i}`,
          document: c.doc
        },
        user: global.testUser
      })
      c.id = result.data.commit.id
    }
    const result = await apolloFetch({
      query: REPO_QUERY,
      variables: {
        repoId
      }
    })
    expect(result.errors).toBeFalsy()
    expect(result.data).toBeTruthy()
    expect(result.data.repo.commits.nodes.length).toBe(commits.length)
  }

  const checkPublication = (publication, name, variables, commit) => {
    expect(publication.name).toBe(name)

    expect(publication.prepublication).toBe(variables.prepublication)
    expect(publication.updateMailchimp).toBe(variables.updateMailchimp)
    if (!variables.scheduledAt) {
      expect(publication.scheduledAt).toBe(null)
    } else {
      expect(publication.scheduledAt).toMatch(variables.scheduledAt.toISOString())
    }

    expect(publication.date).toBeTruthy()

    expect(publication.commit.id).toBe(commit.id)
    checkDocument(publication.commit.document, commit.doc)

    const user = Users.Editor
    expect(publication.author.name).toBe(`${user.firstName} ${user.lastName}`)
    expect(publication.author.email).toBe(user.email)
    expect(publication.author.user.email).toBe(user.email)
  }
  const getPathForMeta = (meta) => {
    return `/${moment().format('YYYY/MM/DD')}/${meta.slug}`
  }

  const checkDocument = (doc, expectedDoc, path) => {
    expect(
      _.pick(doc.meta, [...Object.keys(expectedDoc.content.meta), path ? 'path' : ''].filter(Boolean))
    ).toEqual({
      ...expectedDoc.content.meta,
      ...path ? { path } : {}
    })
  }

  const publish = async (name, commit, variables) => {
    const result = await apolloFetch({
      query: PUBLISH_MUTAION,
      variables: {
        repoId,
        commitId: commit.id,
        ...variables
      }
    })
    expect(result.errors).toBeFalsy()
    expect(result.data.publish.publication).toBeTruthy()

    checkPublication(result.data.publish.publication, name, variables, commit)

    publishHistory[name] = {
      commit,
      variables,
      result,
      waitUntilPublished: async () => {
        if (!variables.scheduledAt) {
          return
        }
        const diff = moment(variables.scheduledAt).diff(moment())
        const waitMs = diff + 1000 * 10 // 10s for publicationScheduler
        console.log('waitMs:', waitMs, waitMs / 1000)
        if (waitMs > 0) {
          await sleep(waitMs)
        }
      }
    }
    return result
  }

  const checkState = async (expectations) => {
    if (expectations.publications) {
      const result = await getLatestPublications({ repoId })
      const publications = result.data.repo.latestPublications
      expect(publications.length).toBe(expectations.publications.length)

      for (let expectedPublication of expectations.publications) {
        const { name, live = true } = expectedPublication
        const publication = publications.find(p => p.name === name)
        expect(publication).toBeTruthy()
        expect(publication.live).toBe(live)
        const { variables, commit } = publishHistory[expectedPublication.name]
        checkPublication(publication, name, variables, commit)
      }
    }

    if (expectations.document) {
      if (expectations.document.editors !== undefined) {
        const expectedDoc = publishHistory[expectations.document.editors].commit.doc
        const path = getPathForMeta(expectedDoc.content.meta)
        const result = await getDocument({
          user: Users.Editor,
          path
        })
        const doc = result.data.document
        checkDocument(doc, expectedDoc, path)
      }
      if (expectations.document.anonymous) {
        const expectedDoc = publishHistory[expectations.document.anonymous].commit.doc
        const path = getPathForMeta(expectedDoc.content.meta)
        const result = await getDocument({
          user: null,
          path
        })
        const doc = result.data.document
        checkDocument(doc, expectedDoc, path)
      }
      if (expectations.document.members !== undefined) {
        const result = await getDocuments({ user: Users.Member })
        const docs = result.data.documents.nodes
        if (expectations.document.members) {
          expect(docs.length).toBe(1)
          const expectedDoc = publishHistory[expectations.document.members].commit.doc
          const path = getPathForMeta(expectedDoc.content.meta)
          checkDocument(docs[0], expectedDoc, path)
        } else {
          expect(docs.length).toBe(0)
        }
      }
    } else {
      const result = await getDocuments({ user: Users.Member })
      const docs = result.data.documents.nodes
      expect(docs.length).toBe(0)
    }

    if (expectations.refs) {
      const refs = await getRefs(repoId)
      expect(refs.length).toBe(Object.keys(expectations.refs).length)

      for (let expectedRefKey of Object.keys(expectations.refs)) {
        const expectedRef = expectations.refs[expectedRefKey]

        const publish = publishHistory[expectedRef]
        expect(publish).toBeTruthy()
        const { sha } = publish.result.data.publish.publication

        const ref = refs.find(r => r.ref === `refs/tags/${expectedRefKey}`)
        expect(ref).toBeTruthy()
        expect(ref.object.sha).toBe(sha)
      }
    }

    if (expectations.redirections) {
      const { pgdb } = global.instance.context
      const redirections = await pgdb.public.redirections.find()
      for (let expectedRedirection of expectations.redirections) {
        const sourcePath = getPathForMeta(publishHistory[expectedRedirection.source].commit.doc.content.meta)
        const targetPath = getPathForMeta(publishHistory[expectedRedirection.target].commit.doc.content.meta)
        const redirection = redirections.find(r => r.source === sourcePath)
        expect(redirection).toBeTruthy()
        expect(redirection.target).toBe(targetPath)
        expect(redirection.resource).toEqual({ repo: { id: repoId } })
      }
    }
  }

  test('v1', async () => {
    await publish('v1', commits[0], {
      prepublication: false,
      updateMailchimp: false
    })
    await checkState({
      publications: [
        { name: 'v1' }
      ],
      document: {
        editors: 'v1',
        members: 'v1',
        anonymous: 'v1'
      },
      refs: {
        publication: 'v1',
        prepublication: 'v1'
      }
    })
  }, timeout)

  test('unauthorized documents query', async () => {
    const result = await getDocuments({ user: null })
    const docs = result.data.documents.nodes
    expect(docs.length).toBe(0)
  })

  test('duplicate slug rejected', async () => {
    const repoId2 = getRepoId('article-slug-duplicate')
    const resultCommit = await commit({
      variables: {
        repoId: repoId2,
        parentId: null,
        message: 'init',
        document: docs.postschiff[0].preCommit
      },
      user: global.testUser
    })
    expect(resultCommit.errors).toBeFalsy()
    expect(resultCommit.data).toBeTruthy()

    const resultPublish = await apolloFetch({
      query: PUBLISH_MUTAION,
      variables: {
        repoId: repoId2,
        commitId: resultCommit.data.commit.id,
        prepublication: false,
        updateMailchimp: false
      }
    })
    expect(resultPublish.errors).toBeTruthy()
    expect(resultPublish.data).toBeNull()
  }, 1000 * 30)

  test('v2-prepublication', async () => {
    await publish('v2-prepublication', commits[1], {
      prepublication: true,
      updateMailchimp: false
    })
    await checkState({
      publications: [
        { name: 'v2-prepublication' },
        { name: 'v1' }
      ],
      document: {
        editors: 'v2-prepublication',
        members: 'v1',
        anonymous: 'v1'
      },
      refs: {
        publication: 'v1',
        prepublication: 'v2-prepublication'
      }
    })
  }, timeout)

  test('v3', async () => {
    await publish('v3', commits[2], {
      prepublication: false,
      updateMailchimp: false
    })
    await checkState({
      publications: [
        { name: 'v3' }
      ],
      document: {
        editors: 'v3',
        members: 'v3',
        anonymous: 'v3'
      },
      refs: {
        publication: 'v3',
        prepublication: 'v3'
      }
    })
  }, timeout)

  test('v4', async () => {
    await publish('v4', commits[0], {
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: moment().add(30, 'seconds')
    })
    await checkState({
      publications: [
        { name: 'v4', live: false },
        { name: 'v3', live: true }
      ],
      document: {
        editors: 'v3',
        members: 'v3',
        anonymous: 'v3'
      },
      refs: {
        publication: 'v3',
        prepublication: 'v3',
        'scheduled-publication': 'v4'
      }
    })
  }, timeout)

  test('v5', async () => {
    await publish('v5', commits[1], {
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: moment().add(20, 'seconds')
    })
    await checkState({
      publications: [
        { name: 'v5', live: false },
        { name: 'v3', live: true }
      ],
      document: {
        editors: 'v3',
        members: 'v3',
        anonymous: 'v3'
      },
      refs: {
        publication: 'v3',
        prepublication: 'v3',
        'scheduled-publication': 'v5'
      }
    })
  }, timeout)

  test('check scheduling v4 and v5', async () => {
    await publishHistory['v4'].waitUntilPublished()
    await publishHistory['v5'].waitUntilPublished()
    await checkState({
      publications: [
        { name: 'v5' }
      ],
      document: {
        editors: 'v5',
        members: 'v5',
        anonymous: 'v5'
      },
      refs: {
        publication: 'v5',
        prepublication: 'v5'
      }
    })
  }, timeout * 2)

  test('v6', async () => {
    await publish('v6', commits[3], {
      prepublication: false,
      updateMailchimp: false
    })
    await checkState({
      publications: [
        { name: 'v6' }
      ],
      document: {
        editors: 'v6',
        members: 'v6',
        anonymous: 'v6'
      },
      refs: {
        publication: 'v6',
        prepublication: 'v6'
      },
      redirections: [
        { source: 'v5', target: 'v6' }
      ]
    })
  }, timeout)

  test('v7', async () => {
    await publish('v7', commits[0], {
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: moment().add(35, 'seconds')
    })
    await checkState({
      publications: [
        { name: 'v7', live: false },
        { name: 'v6', live: true }
      ],
      document: {
        editors: 'v6',
        members: 'v6',
        anonymous: 'v6'
      },
      refs: {
        publication: 'v6',
        prepublication: 'v6',
        'scheduled-publication': 'v7'
      },
      redirections: [
        { source: 'v5', target: 'v6' }
      ]
    })
  }, timeout)

  test('v8-prepublication', async () => {
    await publish('v8-prepublication', commits[1], {
      prepublication: true,
      updateMailchimp: false
    })
    await checkState({
      publications: [
        { name: 'v7', live: false },
        { name: 'v6', live: true },
        { name: 'v8-prepublication', live: true }
      ],
      document: {
        editors: 'v8-prepublication',
        members: 'v6',
        anonymous: 'v6'
      },
      refs: {
        publication: 'v6',
        prepublication: 'v8-prepublication',
        'scheduled-publication': 'v7'
      }
    })
  }, timeout)

  test('check scheduling v7 and v8-prepublication', async () => {
    await publishHistory['v7'].waitUntilPublished()
    await checkState({
      publications: [
        { name: 'v7' }
      ],
      document: {
        editors: 'v7',
        members: 'v7',
        anonymous: 'v7'
      },
      refs: {
        publication: 'v7',
        prepublication: 'v7'
      },
      redirections: [
        { source: 'v6', target: 'v7' }
      ]
    })
  }, timeout * 2)

  test('v9', async () => {
    await publish('v9', commits[2], {
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: moment().add(30, 'seconds')
    })
    await checkState({
      publications: [
        { name: 'v9', live: false },
        { name: 'v7', live: true }
      ],
      document: {
        editors: 'v7',
        members: 'v7',
        anonymous: 'v7'
      },
      refs: {
        publication: 'v7',
        prepublication: 'v7',
        'scheduled-publication': 'v9'
      }
    })
  }, timeout)

  test('unpublish', async () => {
    const result = await apolloFetch({
      query: UNPUBLISH_MUTAION,
      variables: {
        repoId
      }
    })
    expect(result.errors).toBeFalsy()
    expect(result.data).toBeTruthy()
    await publishHistory['v9'].waitUntilPublished()
    await sleep(1000 * 15) // wait for ES
    await checkState({
      publications: [ ],
      document: 0,
      refs: { }
    })
  }, timeout * 2)

  test('v10', async () => {
    await publish('v10-prepublication', commits[0], {
      prepublication: true,
      updateMailchimp: false
    })
    await checkState({
      publications: [
        { name: 'v10-prepublication', live: true }
      ],
      document: {
        editors: 'v10-prepublication',
        members: 0
      },
      refs: {
        prepublication: 'v10-prepublication'
      }
    })
  }, timeout)

  test('v11', async () => {
    await publish('v11', commits[1], {
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: moment().add(25, 'seconds')
    })
    await checkState({
      publications: [
        { name: 'v11', live: false },
        { name: 'v10-prepublication', live: true }
      ],
      document: {
        editors: 'v10-prepublication',
        members: 0
      },
      refs: {
        prepublication: 'v10-prepublication',
        'scheduled-publication': 'v11'
      }
    })
  }, timeout)

  test('v12', async () => {
    await publish('v12', commits[2], {
      prepublication: false,
      updateMailchimp: false
    })
    await checkState({
      publications: [
        { name: 'v12' }
      ],
      document: {
        editors: 'v12',
        members: 'v12',
        anonymous: 'v12'
      },
      refs: {
        publication: 'v12',
        prepublication: 'v12'
      }
    })
  }, timeout)

  test('check scheduling v11 and v12', async () => {
    await publishHistory['v11'].waitUntilPublished()
    await checkState({
      publications: [
        { name: 'v12' }
      ],
      document: {
        editors: 'v12',
        members: 'v12',
        anonymous: 'v12'
      },
      refs: {
        publication: 'v12',
        prepublication: 'v12'
      }
    })
  }, timeout * 2)
})
