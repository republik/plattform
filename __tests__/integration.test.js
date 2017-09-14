// uncomment to see open handles after tests run
// require('leaked-handles')

const test = require('tape-async')

require('dotenv').config({ path: '.test.env' })

const {
  PORT,
  GITHUB_LOGIN,
  PUBLIC_ASSETS_URL,
  PUBLIC_WS_URL_BASE,
  PUBLIC_WS_URL_PATH
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
const WS_URL = PUBLIC_WS_URL_BASE + PUBLIC_WS_URL_PATH
const {
  createApolloFetch,
  createSubscriptionClient
} = require('./clientsWithCookie')
const apolloFetch = createApolloFetch(GRAPHQL_URI)
const MDAST = require('../lib/mdast/mdast')
const {
  githubRest,
  getHeads
} = require('../lib/github')

const getNewRepoId = () =>
  `test-${supervillains.random()}`.replace(/\s/g, '-')

// shared
let pgdb
const testUser = {
  firstName: 'Alice',
  lastName: 'Smith',
  name: 'Alice Smith',
  email: 'alice.smith@test.project-r.construction'
}
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
  const { firstName, lastName, email } = testUser
  const user = await pgdb.public.users.insert({
    firstName,
    lastName,
    email
  })
  t.ok(user)
  t.end()
})

test('unauthorized repos query', async (t) => {
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

test('unauthorized subscription', (t) => {
  const client = createSubscriptionClient(WS_URL, {
    connectionCallback: (error) => {
      t.false(error)
    }
  })
  client.subscribe(
    {
      query: `
        subscription uncommittedChanges(
          $repoId: ID!
        ){
          uncommittedChanges(repoId: $repoId) {
            action
            user {
              id
            }
          }
        }
      `,
      variables: {
        repoId: 'irrelevant'
      }
    },
    (errors, result) => {
      t.ok(errors)
      t.equals(errors.length, 1)
      const error = errors[0]
      t.equals(error.message, tr('api/signIn'))
      t.equals(result, null)
      client.client.close()
      t.end()
    }
  )
})

test('signIn', async (t) => {
  const result = await apolloFetch({
    query: `
      mutation {
        signIn(email: "${testUser.email}") {
          phrase
        }
      }
    `
  })
  await sleep(4000)
  t.ok(result.data.signIn.phrase)
  t.ok(result.data.signIn.phrase.length > 0)
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

test('subscription (signed in, without role)', (t) => {
  const client = createSubscriptionClient(WS_URL, {
    connectionCallback: (error) => {
      t.false(error)
    }
  })
  client.subscribe(
    {
      query: `
        subscription uncommittedChanges(
          $repoId: ID!
        ){
          uncommittedChanges(repoId: $repoId) {
            action
            user {
              id
            }
          }
        }
      `,
      variables: {
        repoId: 'irrelevant'
      }
    },
    (errors, result) => {
      t.ok(errors)
      t.equals(errors.length, 1)
      const error = errors[0]
      t.equals(error.message, tr('api/unauthorized', { role: 'editor' }))
      t.equals(result, null)
      client.client.close()
      t.end()
    }
  )
})

test('add test user to role «editor»', async (t) => {
  const user = await pgdb.public.users.findOne({ email: testUser.email })
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
          firstName
          lastName
          name
          email
          roles
        }
      }
    `
  })
  t.ok(result.data)
  t.ok(result.data.me)
  const { data: { me: { firstName, lastName, name, email, roles } } } = result
  t.equals(firstName, testUser.firstName)
  t.equals(lastName, testUser.lastName)
  t.equals(name, testUser.name)
  t.equals(email, testUser.email)
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
  t.false(result.errors)
  t.ok(result.data.repos)
  t.end()
})

test('commit (create repo)', async (t) => {
  const repoName = getNewRepoId()
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

  t.equals(result.data.commit.repo.id, variables.repoId)
  const { commit } = result.data
  t.deepLooseEqual(commit.parentIds, [])
  t.equals(commit.message, variables.message)
  t.ok(commit.date)
  const { author } = commit
  t.equals(author.name, testUser.name)
  t.equals(author.email, testUser.email)
  t.equals(author.user.email, testUser.email)
  t.ok(commit.date)
  initialCommitId = commit.id

  await sleep(1000)

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
  // console.log(diff(commit.document.content, loremMdastStringifyParse))

  t.end()
})

test('uncommitedChanges (with subscription)', (t) => {
  const client = createSubscriptionClient(WS_URL)
  setTimeout(() => {
    client.subscribe(
      {
        query: `
          subscription uncommittedChanges(
            $repoId: ID!
          ){
            uncommittedChanges(repoId: $repoId) {
              action
              user {
                email
              }
            }
          }
        `,
        variables: {
          repoId: testRepoId
        }
      },
      (errors, result) => {
        t.equals(errors, null)
        t.ok(result)
        const {
          uncommittedChanges: {
            action,
            user: {
              email
            }
          }
        } = result
        client.client.close()
        t.equals(action, 'create')
        t.equals(email, testUser.email)
        client.client.close()
        t.end()
      }
    )
  }, 50)

  setTimeout(() => {
    apolloFetch({
      query: `
        mutation uncommitedChanges(
          $repoId: ID!
          $action: Action!
        ){
          uncommittedChanges(
            repoId: $repoId
            action: $action
          )
        }
      `,
      variables: {
        repoId: testRepoId,
        action: 'create'
      }
    })
  }, 100)
})

test('repo latestCommit, commits-length and -content', async (t) => {
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
            id
            document {
              content
            }
          }
          latestCommit {
            id
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
  t.equals(repo.commits[0].id, repo.latestCommit.id)
  t.equals(repo.latestCommit.id, initialCommitId)
  // TODO discuss why this isnt equivalent
  // const commit = repo.commits[0]
  // const loremMdastStringifyParse = MDAST.parse(MDAST.stringify(loremMdast))
  // t.deepLooseEqual(commit.document.content, loremMdastStringifyParse)
  t.ok(repo.milestones)
  t.equals(repo.milestones.length, 0)
  t.end()
})

test('repo specific commit', async (t) => {
  const result = await apolloFetch({
    query: `
      query repo(
        $repoId: ID!
        $commitId: ID!
      ){
        repo(id: $repoId) {
          commit(id: $commitId) {
            id
          }
        }
      }
    `,
    variables: {
      repoId: testRepoId,
      commitId: initialCommitId
    }
  })
  t.ok(result.data)
  t.ok(result.data.repo)
  t.equals(result.data.repo.commit.id, initialCommitId)
})

test('repo specific commit', async (t) => {
  // invalid
  const result = await apolloFetch({
    query: `
      query repo(
        $repoId: ID!
        $commitId: ID!
      ){
        repo(id: $repoId) {
          commit(id: $commitId) {
            id
          }
        }
      }
    `,
    variables: {
      repoId: testRepoId,
      commitId: '7366d36cb967d7a3ac324c789a8b718e61d01b31'
    }
  })
  t.equals(result.data, null)
  t.ok(result.errors)
  t.ok(result.errors[0].message.indexOf('Not Found') > -1)
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
          id
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
  const { author } = commit
  t.equals(author.name, testUser.name)
  t.equals(author.email, testUser.email)
  t.equals(author.user.email, testUser.email)
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

test('check recommit content and latestCommit', async (t) => {
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
          id
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
          latestCommit {
            id
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
  const { data: { repo: { latestCommit } } } = result2
  t.equals(newCommit.id, latestCommit.id)
  t.equals(result1.data.commit.id, latestCommit.id)
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

test('placeMilestone', async (t) => {
  const variables = {
    repoId: testRepoId,
    commitId: initialCommitId,
    name: '(test) proofread',
    message: 'Anything that prevents you from being friendly, a good neighbour, is a terror tactic.'
  }
  const normalizedName = '(test)-proofread'

  const result0 = await apolloFetch({
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
          message
          commit {
            id
          }
          date
          author {
            name
            email
            user {
              email
            }
          }
        }
      }
    `,
    variables
  })
  t.ok(result0.data)
  const {
    placeMilestone: {
      name,
      message,
      commit,
      date,
      author
    }
  } = result0.data
  t.equals(name, normalizedName)
  t.equals(message, variables.message)
  t.equals(commit.id, variables.commitId)
  t.ok(date)
  t.equals(author.name, testUser.name)
  t.equals(author.email, testUser.email)
  t.equals(author.user.email, testUser.email)

  const result1 = await apolloFetch({
    query: `
      query repo(
        $repoId: ID!
      ){
        repo(id: $repoId) {
          milestones {
            name
            message
            commit {
              id
            }
            date
            author {
              name
              email
              user {
                email
              }
            }
          }
        }
      }
    `,
    variables: {
      repoId: testRepoId
    }
  })
  t.ok(result1.data.repo.milestones)
  t.equals(result1.data.repo.milestones.length, 1)
  const milestone = result1.data.repo.milestones[0]
  t.equals(milestone.name, normalizedName)
  t.equals(milestone.message, variables.message)
  t.equals(milestone.commit.id, variables.commitId)
  t.ok(milestone.date)
  const { author: author0 } = milestone
  t.equals(author0.name, testUser.name)
  t.equals(author0.email, testUser.email)
  t.equals(author0.user.email, testUser.email)
  t.end()
})

test('removeMilestone', async (t) => {
  const variables = {
    repoId: testRepoId,
    name: '(test)-proofread'
  }

  const result0 = await apolloFetch({
    query: `
      mutation removeMilestone(
        $repoId: ID!
        $name: String!
      ){
        removeMilestone(
          repoId: $repoId
          name: $name
        )
      }
    `,
    variables
  })
  t.ok(result0.data)
  t.equals(result0.data.removeMilestone, true)

  const result1 = await apolloFetch({
    query: `
      query repo(
        $repoId: ID!
      ){
        repo(id: $repoId) {
          milestones {
            name
            message
            commit {
              id
            }
          }
        }
      }
    `,
    variables: {
      repoId: testRepoId
    }
  })
  t.ok(result1.data.repo.milestones)
  t.equals(result1.data.repo.milestones.length, 0)
  t.end()
})

test('null parentId on existing repo must be denied', async (t) => {
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
          id
        }
      }
    `,
    variables: {
      repoId: testRepoId,
      message: '(testing) parentId null',
      content: loremMdast,
      parentId: null
    }
  })
  t.equals(result.data, null)
  t.equals(result.errors.length, 1)
  t.equals(result.errors[0].message, tr('api/commit/parentId/required', { repoId: testRepoId }))
  t.end()
})

test('parentId on non existing repo must be denied', async (t) => {
  const repoId = getNewRepoId()
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
    variables: {
      repoId,
      message: '(testing) parentId not null for new repoId',
      content: loremMdast,
      parentId: '7366d36cb967d7a3ac324c789a8b718e61d01b31'
    }
  })
  t.equals(result.data, null)
  t.equals(result.errors.length, 1)
  t.equals(result.errors[0].message, tr('api/commit/parentId/notAllowed', { repoId }))
  t.end()
})

test('signOut', async (t) => {
  const result = await apolloFetch({
    query: `
      mutation {
        signOut
      }
    `
  })
  t.ok(result.data.signOut)
  t.end()
})

test('signOut again', async (t) => {
  const result = await apolloFetch({
    query: `
      mutation {
        signOut
      }
    `
  })
  t.ok(result.data.signOut)
  t.end()
})

test('unauthorized repos query', async (t) => {
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

test('cleanup', async (t) => {
  const [owner, repo] = testRepoId.split('/')
  await githubRest.repos.delete({
    owner,
    repo
  })
  t.end()
})

test('teardown', (t) => {
  Server.close()
  t.end()
})
