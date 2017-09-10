// uncomment to see open handles after tests run
// require('leaked-handles')

const test = require('tape-async')

// fake env vars
if (process.env.NODE_ENV === 'test-local') {
  require('dotenv').config({ path: '.test.env' })
}

const {
  PORT,
  GITHUB_LOGIN
} = process.env

const Server = require('../server')
const Roles = require('../lib/Roles')
const tr = require('../lib/t')
const sleep = require('await-sleep')
const supervillains = require('supervillains')
const loremMdast = require('./lorem.mdast.json')
const loremWithImageMdast = require('./loremWithImage.mdast.json')

const GRAPHQL_URI = `http://localhost:${PORT}/graphql`
const createApolloFetch = require('./createApolloFetchWithCookie')
const apolloFetch = createApolloFetch(GRAPHQL_URI)
const MDAST = require('../lib/mdast/mdast')
const {
  githubRest,
  getHeads
} = require('../lib/github')

let pgdb
const testEmail = 'tester@test.project-r.construction'
let testRepos = []
let initialCommitId

test('setup', async (t) => {
  const server = await Server.run()
  pgdb = server.pgdb

  const result = await apolloFetch({
    query: `
      {
        __schema {
          types {
            name
          }
        }
      }
    `
  })
  t.ok(result.data.__schema)
  t.end()
})

test('unauthorized', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        repos(first: 20) {
          id
          commits(page: 0) {
            id
          }
        }
      }
    `
  })
  t.equals(result.data, null)
  t.equals(result.errors.length, 1)
  t.equals(result.errors[0].message, tr('api/signIn'))
  t.end()
})

test('signin', async (t) => {
  const result = await apolloFetch({
    query: `
      mutation {
        signIn(email: "${testEmail}") {
          phrase
        }
      }
    `
  })
  await sleep(5000)
  t.ok(result.data.signIn.phrase)
  t.ok(result.data.signIn.phrase.length)
  t.end()
})

test('repos (signed in, without role)', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        repos(first: 2) {
          id
        }
      }
    `
  })
  t.equals(result.data, null)
  t.equals(result.errors.length, 1)
  t.equals(result.errors[0].message, tr('api/unauthorized', { role: 'editor' }))
  t.end()
})

test('add test user to role «editor»', async (t) => {
  const user = await pgdb.public.users.findOne({ email: testEmail })
  t.ok(user)
  const roledUser = await Roles.addUserToRole(user.id, 'editor', pgdb)
  t.ok(roledUser)
  t.deepLooseEqual(roledUser.roles, ['editor'])
  t.end()
})

test('me', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        me {
          email
          roles
        }
      }
    `
  })
  t.ok(result.data)
  t.ok(result.data.me)
  const { data: { me: { email, roles } } } = result
  t.equals(email, testEmail)
  t.deepLooseEqual(roles, ['editor'])
  t.end()
})

test('repos (signed in)', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        repos(first: 1) {
          id
        }
      }
    `
  })
  t.ok(result.data)
  t.ok(result.data.repos)
  t.end()
})

test('commit (create repo)', async (t) => {
  const repoName = `test-${supervillains.random()}`.replace(/\s/g, '-')
  const variables = {
    repoId: `${GITHUB_LOGIN}/${repoName}`,
    message: '(testing) inital commit',
    content: loremMdast
  }
  testRepos.push(variables.repoId)
  const result = await apolloFetch({
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
          parentIds
          message
          author {
            name
            email
          }
          date
          document {
            content
          }
          repo {
            id
          }
        }
      }
    `,
    variables
  })
  t.ok(result.data)

  t.equals(result.data.commit.repo.id, variables.repoId)
  const { commit } = result.data
  t.deepLooseEqual(commit.parentIds, [])
  t.equals(commit.message, variables.message)
  t.ok(commit.date)
  t.ok(commit.author.name)
  t.ok(commit.author.email)
  t.ok(commit.date)
  initialCommitId = commit.id

  await sleep(1500)
  const articleMd = await githubRest.repos.getContent({
    owner: GITHUB_LOGIN,
    repo: repoName,
    path: 'article.md'
  })
    .then(({ data: { content, encoding } }) =>
      Buffer.from(content, encoding).toString('utf-8')
    )
    .catch(response => null)
  const markdown = MDAST.stringify(loremMdast)
  t.equals(articleMd, markdown)
  // TODO discuss why this isnt equivalent
  // const loremMdastStringifyParse = MDAST.parse(MDAST.stringify(loremMdast))
  // t.deepLooseEqual(result.data.commit.document.content, loremMdastStringifyParse)

  t.end()
})

test('repo commits length and content', async (t) => {
  const variables = {
    repoId: testRepos[0],
    page: 0
  }
  const result = await apolloFetch({
    query: `
      query repo(
        $repoId: ID!
        $page: Int
      ){
        repo(id: $repoId) {
          commits(page: $page) {
            document {
              content
            }
          }
          milestones {
            name
          }
        }
      }
    `,
    variables
  })

  t.ok(result.data)
  t.ok(result.data.repo)
  const { repo } = result.data
  t.ok(repo.commits)
  t.equals(repo.commits.length, 1)
  // TODO discuss why this isnt equivalent
  // const commit = repo.commits[0]
  // const loremMdastStringifyParse = MDAST.parse(MDAST.stringify(loremMdast))
  // t.deepLooseEqual(commit.document.content, loremMdastStringifyParse)
  t.ok(repo.milestones)
  t.equals(repo.milestones.length, 0)
  t.end()
})

test('commit with image (on same branch)', async (t) => {
  const variables = {
    repoId: testRepos[0],
    message: '(testing) update content with image',
    content: loremWithImageMdast,
    parentId: initialCommitId
  }
  const result = await apolloFetch({
    query: `
      mutation commit(
        $repoId: ID!
        $message: String!
        $content: JSON!
        $parentId: ID
      ){
        commit(
          repoId: $repoId
          message: $message
          document: {
            content: $content
          }
          parentId: $parentId
        ) {
          parentIds
          message
          author {
            name
            email
            user {
              email
            }
          }
          date
          document {
            content
          }
          repo {
            id
          }
        }
      }
    `,
    variables
  })
  t.ok(result.data)
  console.log(result.data.commit.document.content)

  t.equals(result.data.commit.repo.id, variables.repoId)
  const { commit } = result.data
  t.deepLooseEqual(commit.parentIds, [variables.parentId])
  t.equals(commit.message, variables.message)
  t.ok(commit.date)
  t.ok(commit.author.name)
  t.ok(commit.author.email)
  t.ok(commit.date)

  // TODO check extractImage
  /*
  await sleep(1500)

  const articleMd = await githubRest.repos.getContent({
    owner: GITHUB_LOGIN,
    repo: repoName,
    path: 'article.md'
  })
    .then( ({ data: { content, encoding } }) =>
      Buffer.from(content, encoding).toString('utf-8')
    )
    .catch( response => null )
  const markdown = MDAST.stringify(loremMdast)
  t.equals(articleMd, markdown)
  */
  // TODO discuss why this isnt equivalent
  // const loremMdastStringifyParse = MDAST.parse(MDAST.stringify(loremMdast))
  // t.deepLooseEqual(result.data.commit.document.content, loremMdastStringifyParse)
  t.end()
})

test('check num refs', async (t) => {
  const heads = await getHeads(testRepos[0])
  t.equals(heads.length, 1)
  t.end()
})

test('check autobranching commit', async (t) => {
  const variables = {
    repoId: testRepos[0],
    message: '(testing) update content for autobranching',
    content: loremWithImageMdast,
    parentId: initialCommitId
  }
  const result = await apolloFetch({
    query: `
      mutation commit(
        $repoId: ID!
        $message: String!
        $content: JSON!
        $parentId: ID!
      ){
        commit(
          repoId: $repoId
          message: $message
          document: {
            content: $content
          }
          parentId: $parentId
        ) {
          id
        }
      }
    `,
    variables
  })
  t.ok(result.data)
  t.end()
})

test('check num refs', async (t) => {
  const heads = await getHeads(testRepos[0])
  t.equals(heads.length, 2)
  t.end()
})

test('cleanup', async (t) => {
  await Promise.all(testRepos.map(repoId => {
    const [owner, repo] = repoId.split('/')
    return githubRest.repos.delete({
      owner,
      repo
    })
  }))
})

test('teardown', (t) => {
  Server.close()
  t.end()
  // before https://github.com/apollographql/subscriptions-transport-ws/pull/257
  // is fixed, no clean exit is possible
  process.exit(0)
})
