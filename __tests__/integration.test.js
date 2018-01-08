// uncomment to see open handles after tests run
/*
require('leaked-handles').set({
  fullStack: true, // use full stack traces
  timeout: 10000, // run every 30 seconds instead of 5.
  debugSockets: true // pretty print tcp thrown exceptions.
})
*/

const test = require('tape-async')

require('dotenv').config({ path: '.test.env' })
const dedupe = require('dynamic-dedupe')
dedupe.activate()

const {
  PORT,
  GITHUB_LOGIN,
  PUBLIC_ASSETS_URL,
  PUBLIC_WS_URL_BASE,
  PUBLIC_WS_URL_PATH
} = process.env

const Server = require('../server')
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
const omit = require('lodash/omit')
const { Roles } = require('@orbiting/backend-modules-auth')
const { lib: { redis } } = require('@orbiting/backend-modules-base')
const moment = require('moment')
const { timeFormat } = require('@orbiting/backend-modules-formats')

const GRAPHQL_URI = `http://localhost:${PORT}/graphql`
const WS_URL = PUBLIC_WS_URL_BASE + PUBLIC_WS_URL_PATH
const { createApolloFetch } = require('apollo-fetch')
const {
  createApolloFetch: createApolloFetchWithCookie,
  createSubscriptionClient
} = require('./clientsWithCookie')
const apolloFetch = createApolloFetchWithCookie(GRAPHQL_URI)
const apolloFetchUnauthorized = createApolloFetch({ uri: GRAPHQL_URI })
const MDAST = require('@orbiting/remark-preset')
const {
  createGithubClients,
  getHeads
} = require('../lib/github')

const getNewRepoId = () =>
  `test-${supervillains.random()}`.replace(/\s/g, '-')

// shared
let pgdb
let githubRest
const testUser = {
  firstName: 'Alice',
  lastName: 'Smith',
  name: 'Alice Smith',
  email: 'alice.smith@test.project-r.construction'
}
let testRepoId
let initialCommitId
let lastCommitId

test('setup', async (t) => {
  await redis.flushdbAsync()
  await sleep(1000)
  const server = await Server.run()
  pgdb = server.pgdb

  const clients = await createGithubClients()
  githubRest = clients.githubRest

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

/*
test('delete old test repos', async (t) => {
  const response = await githubRest.search.repos({
    q: 'org:orbiting-test test-',
    per_page: 100
  })
  const testRepoNames = response.data.items
    .filter( r => new RegExp(/^test-/).test(r.name) )
    .map( r => r.name )
  for (let repoName of testRepoNames) {
    await githubRest.repos.delete({
      owner: 'orbiting-test',
      repo: repoName
    })
  }
  t.end()
})
*/

test('unauthorized repos query', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        repos {
          nodes {
            id
            commits(page: 0) {
              id
            }
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
  client.request({
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
  }).subscribe({
    // TODO: cleanup
    // subscription returns error message below (async iterator)
    // or some versions, we accept both ways now
    next: (result) => {
      const { errors } = result
      t.ok(errors)
      t.equals(errors.length, 1)
      const error = errors[0]
      t.equals(error.message, tr('api/signIn'))
      client.close()
      t.end()
    },
    error: (errors) => {
      // t.equals(errors, null)
      t.equals(errors.message, 'Subscription must return Async Iterable. Received: [object Object]')
      t.end()
    }
  })
})

// Embed API tests w/ unauthorized user
test('fetch youtube data with unathorized user', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "2-------ds8", embedType: YoutubeEmbed) {
          __typename
          ... on YoutubeEmbed {
            id
            userName
          }
        }
      }
    `
  })
  t.equal(
    result.errors[0].message,
    tr('api/signIn')
  )
  t.end()
})

test('fetch vimeo data with unathorized user', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "200000017", embedType: VimeoEmbed) {
          __typename
          ... on VimeoEmbed {
            id
            userName
          }
        }
      }
    `
  })
  t.equal(
    result.errors[0].message,
    tr('api/signIn')
  )
  t.end()
})

test('fetch twitter data with unathorized user', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "900000000009366656", embedType: TwitterEmbed) {
          __typename
          ... on TwitterEmbed {
            id
            text
            userName
          }
        }
      }
    `
  })
  t.equal(
    result.errors[0].message,
    tr('api/signIn')
  )
  t.end()
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
        repos {
          nodes {
            id
          }
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
  client.request({
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
  }).subscribe({
    // TODO: cleanup
    // subscription returns error message below (async iterator)
    // or some versions, we accept both ways now
    next: (result) => {
      const { errors } = result
      t.ok(errors)
      t.equals(errors.length, 1)
      const error = errors[0]
      t.equals(error.message, tr('api/unauthorized', { role: 'editor' }))
      client.close()
      t.end()
    },
    error: (errors) => {
      // t.equals(errors, null)
      t.equals(errors.message, 'Subscription must return Async Iterable. Received: [object Object]')
      t.end()
    }
  })
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
        repos {
          nodes {
            id
          }
        }
      }
    `
  })
  t.ok(result.data)
  t.false(result.errors)
  t.ok(result.data.repos)
  t.end()
})

let testRepos
const reposQueryTests = require('./reposQuery.js')
test('repos query', async (t) => {
  testRepos = await reposQueryTests(t, apolloFetch, githubRest)
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
              id
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
    client.request({
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
    }).subscribe({
      next: (result) => {
        t.ok(result)
        const {
          uncommittedChanges: {
            action,
            user: {
              email
            }
          }
        } = result.data
        t.equals(action, 'create')
        t.equals(email, testUser.email)
        client.close()
        t.end()
      },
      error: (errors) => {
        t.equals(errors, null)
      }
    })
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

test('check image dataURI is replaced with relative url (incl. image size)', async (t) => {
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
  t.ok(articleMd.indexOf('images/51f77e4beffccd7ef932da07b9333122f1ea20f9.png?size=50x28') > -1)
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
  lastCommitId = newCommit.id
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
          immutable
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
      author,
      immutable
    }
  } = result0.data
  t.equals(name, normalizedName)
  t.equals(message, variables.message)
  t.equals(commit.id, variables.commitId)
  t.ok(date)
  t.equals(author.name, testUser.name)
  t.equals(author.email, testUser.email)
  t.equals(author.user.email, testUser.email)
  t.equals(immutable, false)

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
            immutable
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
  t.equals(milestone.immutable, false)
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

test('publish', async (t) => {
  // omited: image, facebookImage, twitterImage
  const documentMetaOmit = ['image', 'facebookImage', 'twitterImage']
  const documentMetaQuery = `
    meta {
      title
      slug
      emailSubject
      description
      facebookTitle
      facebookDescription
      twitterTitle
      twitterDescription
      path
      publishDate
    }
  `
  // publishDate
  // template
  // feed
  // kind
  // format
  // dossier
  // credits

  const publishMutation = `
    mutation publish(
      $repoId: ID!
      $commitId: ID!
      $prepublication: Boolean!
      $updateMailchimp: Boolean!
      $scheduledAt: DateTime
    ) {
      publish(
        repoId: $repoId
        commitId: $commitId
        prepublication: $prepublication
        updateMailchimp: $updateMailchimp
        scheduledAt: $scheduledAt
      ) {
        unresolvedRepoIds
        publication {
          name
          live
          sha
          prepublication
          updateMailchimp
          scheduledAt
          date
          author {
            name
            email
            user {
              email
            }
          }
          commit {
            id
            document {
              content
              ${documentMetaQuery}
            }
          }
        }
      }
    }
  `
  const latestPublicationsQuery = `
      query latestPublications(
        $repoId: ID!
      ){
        repo(id: $repoId) {
          meta {
            publishDate
          }
          latestPublications {
            name
            live
            sha
            prepublication
            scheduledAt
            updateMailchimp
            date
            author {
              name
              email
              user {
                email
              }
            }
            commit {
              id
              document {
                content
                ${documentMetaQuery}
              }
            }
          }
        }
      }
  `

  const documentsQuery = `
    {
      documents {
        nodes {
          content
          ${documentMetaQuery}
        }
      }
    }
  `

  const unpublishMutation = `
    mutation unpublish(
      $repoId: ID!
    ) {
      unpublish(repoId: $repoId)
    }
  `

  const testPublication = (publishResponse, vars) => {
    // TODO test unresolvedRepoIds
    const {
      publication
    } = publishResponse
    t.ok(publication, 'publication exists on publishResponse')
    const {
      name,
      live,
      prepublication,
      updateMailchimp,
      scheduledAt,
      date,
      author,
      commit
    } = publication
    t.equals(name, vars.name)
    t.equals(live, vars.live)
    t.equals(prepublication, vars.prepublication)
    t.equals(updateMailchimp, vars.updateMailchimp)
    if (vars.scheduledAt) {
      t.equals(scheduledAt, vars.scheduledAt.toISOString())
    } else {
      t.equals(scheduledAt, null)
    }
    t.equals(commit.id, vars.commitId)
    t.ok(commit.document.content, 'testPublication commit.document.content')
    t.ok(date)
    t.equals(author.name, testUser.name)
    t.equals(author.email, testUser.email)
    t.equals(author.user.email, testUser.email)
  }

  const checkDocuments = (documents, _documents, publishDate) => {
    t.equals(documents.length, _documents.length)
    // console.log('documents', documents)
    // console.log('_documents', _documents)
    for (let _doc of _documents) {
      const doc = documents.find(d => d.meta.title === _doc.meta.title)
      t.ok(doc, 'expected document present')
      const __documentMetaOmit = ['publishDate']
      if (!_doc.meta.path) { // if not in test data, omit
        __documentMetaOmit.push('path')
      }
      t.deepLooseEqual(omit(doc.meta, __documentMetaOmit), omit(_doc.meta, documentMetaOmit))
      if (publishDate) {
        t.ok(moment(publishDate).isSame(moment(doc.meta.publishDate)), 'docMeta.publishDate matches repoMeta.publishDate')
      }
      t.ok(doc.content)
    }
  }

  const test = async ({
    variables,
    publications,
    documents: _documents,
    unauthorizedDocuments: _unauthorizedDocuments,
    refs: _refs,
    repoMeta: _repoMeta,
    redirections: _redirections
  }) => {
    const name = publications.length
      ? publications[0].name
      : ''
    console.log(`--------------------- test ${name} ---------------------`)

    let activeMilestone
    if (variables) {
      const mutation = await apolloFetch({
        query: publishMutation,
        variables
      })
      t.ok(mutation.data)
      testPublication(mutation.data.publish, publications[0])
      activeMilestone = mutation.data.publish
    }

    const fetchLatestPublications = await apolloFetch({
      query: latestPublicationsQuery,
      variables: {
        repoId: testRepoId
      }
    })
    t.ok(fetchLatestPublications.data.repo.latestPublications)
    const latestPublications = fetchLatestPublications.data.repo.latestPublications
    // console.log('publications:', publications)
    // console.log('latestPublications:', latestPublications)
    t.equals(latestPublications.length, publications.length)

    // console.log('latestPublications', latestPublications)
    for (let publication of publications) {
      const latestPublication = latestPublications.find(pub => pub.name === publication.name)
      t.ok(latestPublication, `expected latestPublication (${publication.name}) present`)
      testPublication(latestPublication, publication)
    }

    let repoMetaPublishDate
    if (_repoMeta) {
      t.ok(fetchLatestPublications.data.repo.meta)
      const repoMeta = fetchLatestPublications.data.repo.meta
      if (_repoMeta.publishDateFrom) {
        t.ok(repoMeta.publishDate, 'publishDate present')
        t.ok(moment(repoMeta.publishDate).isBetween(_repoMeta.publishDateFrom, _repoMeta.publishDateTo), 'publishDate in acc. range')
        repoMetaPublishDate = repoMeta.publishDate
      }
    }

    if (_documents) {
      const fetchDocuments = await apolloFetch({
        query: documentsQuery
      })
      t.ok(fetchDocuments.data.documents.nodes)
      // console.log('authenticated')
      checkDocuments(fetchDocuments.data.documents.nodes, _documents, repoMetaPublishDate)
    }

    if (_unauthorizedDocuments) {
      const fetchDocumentsUnauth = await apolloFetchUnauthorized({
        query: documentsQuery
      })
      t.ok(fetchDocumentsUnauth.data.documents.nodes)
      // console.log('not authenticated')
      checkDocuments(fetchDocumentsUnauth.data.documents.nodes, _unauthorizedDocuments, repoMetaPublishDate)
    }

    // console.log('redirections')
    const redirections = await pgdb.public.redirections.find()
    // console.log(redirections)
    if (_redirections) {
      for (let _redirection of _redirections) {
        const redir = redirections.find(r => r.source === _redirection.source)
        t.ok(redir, 'redirection preset')
        t.equals(redir.target, _redirection.target, 'target matches')
        t.deepLooseEqual(redir.resource, _redirection.resource, 'resource matches')
      }
    }

    const liveRefs = [
      'publication',
      'prepublication'
    ]
    const allRefs = [
      ...liveRefs,
      'scheduled-publication',
      'scheduled-prepublication'
    ]

    const [owner, repo] = testRepoId.split('/')
    const activeRefs = await Promise.all([
      ...allRefs.map(ref =>
        githubRest.gitdata.getReference({
          owner,
          repo,
          ref: `tags/${ref}`
        })
          .then(response => response.data)
          .catch(e => {})
      )
    ])
      .then(refs => refs
        .filter(Boolean)
      )

    // console.log('activeRefs', activeRefs)
    t.equals(activeRefs.length, _refs.length)
    for (let _ref of _refs) {
      const activeRef = activeRefs.find(r => r.ref === `refs/tags/${_ref.name}`)
      t.ok(activeRef, 'expected ref present')
      if (_ref.sha) {
        t.equals(activeRef.object.sha, _ref.sha)
      } else {
        t.equals(activeRef.object.sha, activeMilestone.sha)
      }
    }

    return activeMilestone
  }
  const slugDateFormat = timeFormat('%Y/%m/%d')
  const now = moment()
  const soon = moment(now).add(10, 'minutes')

  const v1 = await test({
    variables: {
      repoId: testRepoId,
      commitId: initialCommitId,
      prepublication: false,
      updateMailchimp: false
    },
    publications: [
      {
        name: 'v1',
        live: true,
        commitId: initialCommitId,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: {
          ...loremMdast.meta,
          path: `/${slugDateFormat(now)}/${loremMdast.meta.slug}`
        }
      }
    ],
    unauthorizedDocuments: [
      {
        meta: {
          ...loremMdast.meta,
          path: `/${slugDateFormat(now)}/${loremMdast.meta.slug}`
        }
      }
    ],
    refs: [
      { name: 'publication', sha: null },
      { name: 'prepublication', sha: null }
    ],
    repoMeta: {
      publishDateFrom: now,
      publishDateTo: soon
    }
  })

  // test slug duplicates
  {
    const testRepo = testRepos[0]
    const mutation = await apolloFetch({
      query: publishMutation,
      variables: {
        repoId: testRepo.id,
        commitId: testRepo._commitId,
        prepublication: false,
        updateMailchimp: false
      }
    })
    t.equals(mutation.data, null, 'dup slug, not data')
    t.equals(mutation.errors.length, 1, 'dup slug errors present')
  }

  await test({
    variables: {
      repoId: testRepoId,
      commitId: lastCommitId,
      prepublication: true,
      updateMailchimp: false
    },
    publications: [
      {
        name: 'v2-prepublication',
        live: true,
        commitId: lastCommitId,
        prepublication: true,
        updateMailchimp: false
      },
      {
        name: 'v1',
        live: true,
        commitId: v1.commit.id,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: {
          ...loremWithImageMdast.meta,
          path: `/${slugDateFormat(now)}/${loremWithImageMdast.meta.slug}`
        }
      }
    ],
    unauthorizedDocuments: [
      {
        meta: {
          ...loremMdast.meta,
          path: `/${slugDateFormat(now)}/${loremMdast.meta.slug}`
        }
      }
    ],
    refs: [
      { name: 'publication', sha: v1.sha },
      { name: 'prepublication', sha: null }
    ],
    repoMeta: {
      publishDateFrom: now,
      publishDateTo: soon
    }
  })

  const v3 = await test({
    variables: {
      repoId: testRepoId,
      commitId: initialCommitId,
      prepublication: false,
      updateMailchimp: false
    },
    publications: [
      {
        name: 'v3',
        live: true,
        commitId: initialCommitId,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: null },
      { name: 'prepublication', sha: null }
    ]
  })

  let v4ScheduledAt = new Date()
  v4ScheduledAt.setSeconds(v4ScheduledAt.getSeconds() + 30)
  await test({
    variables: {
      repoId: testRepoId,
      commitId: lastCommitId,
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: v4ScheduledAt
    },
    publications: [
      {
        name: 'v4',
        live: false,
        commitId: lastCommitId,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v4ScheduledAt
      },
      {
        name: 'v3',
        live: true,
        commitId: v3.commit.id,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v3.sha },
      { name: 'prepublication', sha: v3.sha },
      { name: 'scheduled-publication', sha: null }
    ]
  })

  let v5ScheduledAt = new Date()
  v5ScheduledAt.setSeconds(v5ScheduledAt.getSeconds() + 20)
  const v5 = await test({
    variables: {
      repoId: testRepoId,
      commitId: initialCommitId,
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: v5ScheduledAt
    },
    publications: [
      {
        name: 'v5',
        live: false,
        commitId: initialCommitId,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v5ScheduledAt
      },
      {
        name: 'v3',
        live: true,
        commitId: v3.commit.id,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v3.sha },
      { name: 'prepublication', sha: v3.sha },
      { name: 'scheduled-publication', sha: null }
    ]
  })
  await sleep(30 * 1000)
  await test({
    variables: null,
    publications: [
      {
        name: 'v5',
        live: true,
        commitId: v5.commit.id,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v5ScheduledAt
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v5.sha },
      { name: 'prepublication', sha: v5.sha }
    ]
  })

  let redirections = [
    {
      source: `/${slugDateFormat(now)}/${loremMdast.meta.slug}`,
      target: `/${slugDateFormat(now)}/${loremWithImageMdast.meta.slug}`,
      resource: { repo: { id: testRepoId } }
    }
  ]

  const v6 = await test({
    variables: {
      repoId: testRepoId,
      commitId: lastCommitId,
      prepublication: false,
      updateMailchimp: false
    },
    publications: [
      {
        name: 'v6',
        live: true,
        commitId: lastCommitId,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: null },
      { name: 'prepublication', sha: null }
    ],
    redirections
  })

  let v7ScheduledAt = new Date()
  v7ScheduledAt.setSeconds(v7ScheduledAt.getSeconds() + 30)
  const v7 = await test({
    variables: {
      repoId: testRepoId,
      commitId: initialCommitId,
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: v7ScheduledAt
    },
    publications: [
      {
        name: 'v7',
        live: false,
        commitId: initialCommitId,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v7ScheduledAt
      },
      {
        name: 'v6',
        live: true,
        commitId: v6.commit.id,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v6.sha },
      { name: 'prepublication', sha: v6.sha },
      { name: 'scheduled-publication', sha: null }
    ],
    redirections
  })

  await test({
    variables: {
      repoId: testRepoId,
      commitId: lastCommitId,
      prepublication: true,
      updateMailchimp: false
    },
    publications: [
      {
        name: 'v8-prepublication',
        live: true,
        commitId: lastCommitId,
        prepublication: true,
        updateMailchimp: false
      },
      {
        name: 'v7',
        live: false,
        commitId: v7.commit.id,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v7ScheduledAt
      },
      {
        name: 'v6',
        live: true,
        commitId: v6.commit.id,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v6.sha },
      { name: 'prepublication', sha: null },
      { name: 'scheduled-publication', sha: v7.sha }
    ],
    redirections
  })
  await sleep(31 * 1000)
  // turn around
  redirections = [
    {
      source: `/${slugDateFormat(now)}/${loremWithImageMdast.meta.slug}`,
      target: `/${slugDateFormat(now)}/${loremMdast.meta.slug}`,
      resource: { repo: { id: testRepoId } }
    }
  ]
  //
  await test({
    variables: null,
    publications: [
      {
        name: 'v7',
        live: true,
        commitId: v7.commit.id,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v7ScheduledAt
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v7.sha },
      { name: 'prepublication', sha: v7.sha }
    ],
    redirections
  })

  let v9ScheduledAt = new Date()
  v9ScheduledAt.setSeconds(v9ScheduledAt.getSeconds() + 20)
  await test({
    variables: {
      repoId: testRepoId,
      commitId: lastCommitId,
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: v9ScheduledAt
    },
    publications: [
      {
        name: 'v9',
        live: false,
        commitId: lastCommitId,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v9ScheduledAt
      },
      {
        name: 'v7',
        live: true,
        commitId: v7.commit.id,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v7ScheduledAt
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v7.sha },
      { name: 'prepublication', sha: v7.sha },
      { name: 'scheduled-publication', sha: null }
    ],
    redirections
  })

  await apolloFetch({
    query: unpublishMutation,
    variables: {
      repoId: testRepoId
    }
  })

  await sleep(25 * 1000)

  await test({
    variables: null,
    publications: [
    ],
    documents: [
    ],
    unauthorizedDocuments: [
    ],
    refs: [
    ],
    redirections
  })

  const v10 = await test({
    variables: {
      repoId: testRepoId,
      commitId: initialCommitId,
      prepublication: true,
      updateMailchimp: false
    },
    publications: [
      {
        name: 'v10-prepublication',
        live: true,
        commitId: initialCommitId,
        prepublication: true,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [],
    refs: [
      { name: 'prepublication', sha: null }
    ],
    redirections
  })

  let v11ScheduledAt = new Date()
  v11ScheduledAt.setSeconds(v11ScheduledAt.getSeconds() + 20)
  await test({
    variables: {
      repoId: testRepoId,
      commitId: lastCommitId,
      prepublication: false,
      updateMailchimp: false,
      scheduledAt: v11ScheduledAt
    },
    publications: [
      {
        name: 'v11',
        live: false,
        commitId: lastCommitId,
        prepublication: false,
        updateMailchimp: false,
        scheduledAt: v11ScheduledAt
      },
      {
        name: 'v10-prepublication',
        live: true,
        commitId: v10.commit.id,
        prepublication: true,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremMdast.meta
      }
    ],
    unauthorizedDocuments: [],
    refs: [
      { name: 'prepublication', sha: v10.sha },
      { name: 'scheduled-publication', sha: null }
    ],
    redirections
  })

  const v12 = await test({
    variables: {
      repoId: testRepoId,
      commitId: lastCommitId,
      prepublication: false,
      updateMailchimp: false
    },
    publications: [
      {
        name: 'v12',
        live: true,
        commitId: lastCommitId,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: null },
      { name: 'prepublication', sha: null }
    ],
    redirections
  })

  await sleep(25 * 1000)
  await test({
    variables: null,
    publications: [
      {
        name: 'v12',
        live: true,
        commitId: v12.commit.id,
        prepublication: false,
        updateMailchimp: false
      }
    ],
    documents: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    unauthorizedDocuments: [
      {
        meta: loremWithImageMdast.meta
      }
    ],
    refs: [
      { name: 'publication', sha: v12.sha },
      { name: 'prepublication', sha: v12.sha }
    ],
    redirections
  })

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

// Embed API tests
test('fetch youtube data', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "2lXD0vv-ds8", embedType: YoutubeEmbed) {
          __typename
          ... on YoutubeEmbed {
            id
            userName
          }
        }
      }
    `
  })
  t.deepEqual(result.data.embed, {
    __typename: 'YoutubeEmbed',
    id: '2lXD0vv-ds8',
    userName: 'FlyingLotusVEVO'
  })
  t.end()
})

test('fetch youtube data with invalid id', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "2-------ds8", embedType: YoutubeEmbed) {
          __typename
          ... on YoutubeEmbed {
            id
            userName
          }
        }
      }
    `
  })
  t.equal(
    result.errors[0].message,
    'Youtube API Error: No video found with ID 2-------ds8.'
  )
  t.end()
})

test('fetch vimeo data', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "229537127", embedType: VimeoEmbed) {
          __typename
          ... on VimeoEmbed {
            id
            userName
          }
        }
      }
    `
  })
  t.deepEqual(result.data.embed, {
    __typename: 'VimeoEmbed',
    id: '229537127',
    userName: 'FutureDeluxe'
  })
  t.end()
})

test('fetch vimeo data with invalid id', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "200000017", embedType: VimeoEmbed) {
          __typename
          ... on VimeoEmbed {
            id
            userName
          }
        }
      }
    `
  })
  t.equal(
    result.errors[0].message,
    'Vimeo API Error: The requested video could not be found.'
  )
  t.end()
})

test('fetch twitter data', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "931088218279366656", embedType: TwitterEmbed) {
          __typename
          ... on TwitterEmbed {
            id
            text
            userName
          }
        }
      }
    `
  })
  t.deepEqual(result.data.embed, {
    __typename: 'TwitterEmbed',
    id: '931088218279366656',
    text: 'What’s the manager’s message to the fans ahead of #AFCvTHFC?\n\n“Just to support the team and stand with us for the 90 minutes”\n\n#WeAreTheArsenal🔴 https://t.co/GQM6lFfcVr',
    userName: 'Arsenal FC'
  })
  t.end()
})

test('fetch twitter data with invalid id', async (t) => {
  const result = await apolloFetch({
    query: `
      {
        embed(id: "900000000009366656", embedType: TwitterEmbed) {
          __typename
          ... on TwitterEmbed {
            id
            text
            userName
          }
        }
      }
    `
  })
  t.equal(
    result.errors[0].message,
    'Twitter API Errors: 144: No status found with that ID.'
  )
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
        repos {
          nodes {
            id
            commits(page: 0) {
              id
            }
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
  for (let _repo of [...testRepos, testRepoId]) {
    const [owner, repo] = _repo.id.split('/')
    await githubRest.repos.delete({
      owner,
      repo
    })
  }
  t.end()
})

test('teardown', (t) => {
  Server.close()
  t.end()
})
