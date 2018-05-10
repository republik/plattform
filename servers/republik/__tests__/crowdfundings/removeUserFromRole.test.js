const test = require('tape-async')
const { connectIfNeeded, apolloFetch, pgDatabase } = require('../helpers.js')
const { signIn, signOut, Users } = require('../auth.js')

const REMOVE_USER_FROM_ROLE = `
  mutation removeUserFromRole($userId: ID!, $role: String!) {
    user: removeUserFromRole(userId: $userId, role: $role) {
      id
      roles
    }
  }
`

const removeUserFromRole = async ({ userId, role }) => {
  return apolloFetch({
    query: REMOVE_USER_FROM_ROLE,
    variables: {
      userId, role
    }
  })
}

const prepare = async (options) => {
  await connectIfNeeded()
  await pgDatabase().public.users.truncate({ cascade: true })
}

test.only('removeUserFromRole: Users.Admin removes role from Users.Supporter', async (t) => {
  await prepare()
  await pgDatabase().public.users.insert(Users.Supporter)
  await signIn({ user: Users.Admin })

  const result = await removeUserFromRole({
    userId: Users.Supporter.id,
    role: 'supporter'
  })
  const user = await pgDatabase().public.users.findOne({ id: Users.Supporter.id })
  t.deepEqual(user.roles, [], 'the db user object no longer has the role `supporter`')
  t.deepEqual(result.data.user.roles, [], 'the graphq result shows an empty roles array')

  await signOut()
  t.end()
})

test('removeUserFromRole: Users.Supporter removes role from Users.Member', async (t) => {
  await prepare()
  await pgDatabase().public.users.insert(Users.Member)
  await signIn({ user: Users.Supporter })

  const result = await removeUserFromRole({
    userId: Users.Member.id,
    role: 'member'
  })
  const user = await pgDatabase().public.users.findOne({ id: Users.Member.id })
  t.deepEqual(user.roles, ['member'], 'the db user object is unchanged')
  t.ok(result.errors, 'rejects calls from non-admins')

  await signOut()
  t.end()
})
