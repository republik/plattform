// uncomment to see open handles after tests run
// require('leaked-handles')

const test = require('tape-async')

// fake env vars
if (process.env.NODE_ENV === 'testing-local') {
  require('dotenv').config({ path: '.test.env' })
}

const {
  PORT,
  GITHUB_LOGIN,
  PUBLIC_ASSETS_URL
} = process.env

const Server = require('../server')
const Roles = require('../lib/Roles')
const tr = require('../lib/t')
const sleep = require('await-sleep')
const util = require('util')
const supervillains = require('supervillains')
const visit = require('unist-util-visit')
const loremMdast = require('./lorem.mdast.json')
const loremWithImageMdast = require('./loremWithImage.mdast.json')
const dataUriToBuffer = require('data-uri-to-buffer')
const diff = require('deep-diff').diff
const fetch = require('isomorphic-unfetch')

const GRAPHQL_URI = `http://localhost:${PORT}/graphql`
const createApolloFetch = require('./createApolloFetchWithCookie')
const apolloFetch = createApolloFetch(GRAPHQL_URI)
const MDAST = require('../lib/mdast/mdast')
const {
  githubRest,
  getHeads
} = require('../lib/github')

// shared
let pgdb
const testEmail = 'tester@test.project-r.construction'
let testRepoId
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
  testRepoId = variables.repoId
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
    repoId: testRepoId,
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
    repoId: testRepoId,
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
  // console.log(util.inspect(result.data.commit.document.content, {depth: null}))

  t.equals(result.data.commit.repo.id, variables.repoId)
  const { commit } = result.data
  t.deepLooseEqual(commit.parentIds, [variables.parentId])
  t.equals(commit.message, variables.message)
  t.ok(commit.date)
  t.ok(commit.author.name)
  t.ok(commit.author.email)
  t.ok(commit.date)

  await sleep(1000)

  // const markdown = MDAST.stringify(loremMdast)
  // t.equals(articleMd, markdown)

  // TODO discuss why this isnt equivalent
  // const loremMdastStringifyParse = MDAST.parse(MDAST.stringify(loremMdast))
  // t.deepLooseEqual(result.data.commit.document.content, loremMdastStringifyParse)
  t.end()
})

test('check image dataURI is replaced with relative url', async (t) => {
  // get article.md from repo
  const [owner, repo] = testRepoId.split('/')
  const articleMd = await githubRest.repos.getContent({
    owner,
    repo,
    path: 'article.md'
  })
    .then(({ data: { content, encoding } }) =>
      Buffer.from(content, encoding).toString('utf-8')
    )
    .catch(response => null)
  t.ok(articleMd)
  t.ok(articleMd.indexOf('images/c0313cccd1aacffecf8a4fef6a44aef9676b5b61.jpeg') > -1)
  t.end()
})

test('check image URLs and asset server', async (t) => {
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
        }
      }
    `,
    variables: {
      repoId: testRepoId,
      page: 0
    }
  })
  t.ok(result.data.repo.commits)
  const articleMdast = result.data.repo.commits[0].document.content

  // extract imageUrls
  let imageUrls = []
  visit(articleMdast, 'image', node => {
    imageUrls.push(node.url)
  })
  t.equals(imageUrls.length, 1)

  // check for PUBLIC_ASSETS_URL
  for (let imageUrl of imageUrls) {
    t.equals(imageUrl.indexOf(PUBLIC_ASSETS_URL), 0)
  }

  // download images via asset server
  const imageBuffersFromServer = await Promise.all(
    imageUrls.map(imageUrl =>
        fetch(imageUrl)
          .then(response => response.buffer())
    )
  )
  t.equals(imageBuffersFromServer.length, imageUrls.length)

  // get imageDataUrls from loremWithImageMdast
  let imageBuffersFromLorem = []
  visit(loremWithImageMdast, 'image', node => {
    imageBuffersFromLorem.push(dataUriToBuffer(node.url))
  })
  t.equals(imageBuffersFromLorem.length, imageBuffersFromServer.length)

  for (let i = 0; i < imageBuffersFromServer.length; i++) {
    const buffer0 = imageBuffersFromLorem[i]
    const buffer1 = imageBuffersFromServer[i]
    t.notEquals(buffer0, null)
    t.notEquals(buffer1, null)
    t.notEquals(buffer0, undefined)
    t.notEquals(buffer1, undefined)
    t.equals(buffer0.compare(buffer1), 0)
  }
  t.end()
})

test('check recommit content', async (t) => {
  const result0 = await apolloFetch({
    query: `
      query repo(
        $repoId: ID!
        $page: Int
      ){
        repo(id: $repoId) {
          commits(page: $page) {
            id
            document {
              content
            }
          }
        }
      }
    `,
    variables: {
      repoId: testRepoId,
      page: 0
    }
  })
  t.ok(result0.data.repo.commits)
  const originalCommit = result0.data.repo.commits[0]
  const originalContent = originalCommit.document.content
  t.ok(originalContent)

  const result1 = await apolloFetch({
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
    variables: {
      repoId: testRepoId,
      message: '(testing) commit with identical content',
      content: originalContent,
      parentId: originalCommit.id
    }
  })
  t.ok(result1.data)

  const result2 = await apolloFetch({
    query: `
      query repo(
        $repoId: ID!
        $page: Int
      ){
        repo(id: $repoId) {
          commits(page: $page) {
            id
            document {
              content
            }
          }
        }
      }
    `,
    variables: {
      repoId: testRepoId,
      page: 0
    }
  })
  t.ok(result2.data.repo.commits)
  const newCommit = result2.data.repo.commits[0]
  const newContent = newCommit.document.content

  t.notEquals(originalCommit.id, newCommit.id)
  t.deepLooseEqual(originalContent, newContent)
  const contentDiff = diff(originalContent, newContent)
  if (contentDiff) {
    console.log('The last test failed due to the following diff')
    console.log(util.inspect(diff, {depth: null}))
  }
  t.end()
})

test('check num refs', async (t) => {
  const heads = await getHeads(testRepoId)
  t.equals(heads.length, 1)
  t.end()
})

test('check autobranching commit', async (t) => {
  const variables = {
    repoId: testRepoId,
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
  const heads = await getHeads(testRepoId)
  t.equals(heads.length, 2)
  t.end()
})

test('cleanup', async (t) => {
  const [owner, repo] = testRepoId.split('/')
  return githubRest.repos.delete({
    owner,
    repo
  })
})

test('teardown', (t) => {
  Server.close()
  t.end()
  // before https://github.com/apollographql/subscriptions-transport-ws/pull/257
  // is fixed, no clean exit is possible
  process.exit(0)
})
