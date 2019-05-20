const { Instance } = require('@orbiting/backend-modules-test')

const {
  Users
} = require('@orbiting/backend-modules-auth/__tests__/auth')
const {
  UNCOMMITED_CHANGES_SUBSCRIPTION,
  UNCOMMITED_CHANGES_MUTATION
} = require('./graphqlQueries.js')

beforeAll(async () => {
  await Instance.init({ serverName: 'publikator' })
}, 60000)

afterAll(async () => {
  await global.instance.closeAndCleanup()
}, 60000)

beforeEach(async () => {
  global.testUser = null
})

const tr = (...args) => global.instance.context.t(...args)

test('no user uncommittedChanges', async () => {
  const { createSubscriptionClient } = global.instance.clients
  await new Promise((resolve) => {
    const client = createSubscriptionClient({
      connectionCallback: (error) => {
        expect(error).toBeFalsy()
      }
    })
    client.request({
      query: UNCOMMITED_CHANGES_SUBSCRIPTION,
      variables: {
        repoId: 'irrelevant'
      }
    }).subscribe({
      next: (result) => {
        expect(result).toBeTruthy()
        expect(result.errors).toBeTruthy()
        expect(result.errors.length).toBe(1)
        expect(result.errors[0].message).toBe(tr('api/signIn'))
        client.close()
        resolve()
      }
      // error: (errors) => {
    })
  })
})

test('no role uncommittedChanges', async () => {
  const { createSubscriptionClient } = global.instance.clients
  global.testUser = {
    email: 'alice.smith@test.project-r.construction',
    roles: [ ]
  }
  await new Promise((resolve) => {
    const client = createSubscriptionClient({
      connectionCallback: (error) => {
        expect(error).toBeFalsy()
      }
    })
    client.request({
      query: UNCOMMITED_CHANGES_SUBSCRIPTION,
      variables: {
        repoId: 'irrelevant'
      }
    }).subscribe({
      next: (result) => {
        expect(result).toBeTruthy()
        expect(result.errors).toBeTruthy()
        expect(result.errors.length).toBe(1)
        expect(result.errors[0].message).toBe(tr('api/unauthorized', { role: 'editor' }))
        client.close()
        resolve()
      }
    })
  })
})

test('uncommittedChanges', async () => {
  const { createSubscriptionClient } = global.instance.clients
  const { apolloFetch } = global.instance

  const user = Users.Editor
  global.testUser = user
  const repoId = 'fake/fake'
  const action = 'create'

  await new Promise((resolve) => {
    const client = createSubscriptionClient({
      connectionCallback: (error) => {
        expect(error).toBeFalsy()
      }
    })
    client.onConnected(() => {
      setTimeout(() => {
        apolloFetch({
          query: UNCOMMITED_CHANGES_MUTATION,
          variables: {
            repoId,
            action
          }
        })
      }, 200)
    })

    client.request({
      query: UNCOMMITED_CHANGES_SUBSCRIPTION,
      variables: {
        repoId
      }
    }).subscribe({
      next: (result) => {
        expect(result).toBeTruthy()
        expect(result.errors).toBeFalsy()
        expect(result.data).toBeTruthy()
        expect(result.data.uncommittedChanges.action).toBe(action)
        expect(result.data.uncommittedChanges.user.email).toBe(user.email)
        client.close()
        resolve()
      }
    })
  })
})
