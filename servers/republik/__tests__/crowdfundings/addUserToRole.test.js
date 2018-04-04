const test = require('tape-async')
const { connectIfNeeded, apolloFetch, pgDatabase } = require('../helpers.js')
const { signIn, signOut, Users } = require('../auth.js')

const ADD_USER_TO_ROLE = `
  mutation addUserToRole($userId: ID!, $role: String!) {
    user: addUserToRole(userId: $userId, role: $role) {
      id
      roles
    }
  }
`

const addUserToRole = async ({ userId, role }) => {
  return apolloFetch({
    query: ADD_USER_TO_ROLE,
    variables: {
      userId, role
    }
  })
}

const prepare = async (options) => {
  await connectIfNeeded()
  await pgDatabase().public.users.truncate({ cascade: true })
}

test('addUserToRole: Users.Admin adds role to Users.Supporter', async (t) => {
  await prepare()
  await pgDatabase().public.users.insert(Users.Supporter)
  await signIn({ user: Users.Admin })

  const result = await addUserToRole({
    userId: Users.Supporter.id,
    role: 'editor'
  })
  const user = await pgDatabase().public.users.findOne({ id: Users.Supporter.id })
  t.deepEqual(user.roles, ['supporter', 'editor'], 'the db user object has the new role `editor`')
  t.deepEqual(result.data.user.roles, ['supporter', 'editor'], 'the graphq result includes the new role `editor`')

  await signOut()
  t.end()
})

test('addUserToRole: Users.Supporter adds role to Users.Member', async (t) => {
  await prepare()
  await pgDatabase().public.users.insert(Users.Member)
  await signIn({ user: Users.Supporter })

  const result = await addUserToRole({
    userId: Users.Member.id,
    role: 'editor'
  })
  const user = await pgDatabase().public.users.findOne({ id: Users.Member.id })
  t.deepEqual(user.roles, ['member'], 'the db user object is unchanged')
  t.ok(result.errors, 'rejects calls from non-admins')

  await signOut()
  t.end()
})
