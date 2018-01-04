const fetch = require('node-fetch')
const { apolloFetch, pgDatabase } = require('./helpers')

const LOGIN_USER_MUTATION = `
  mutation signIn($email: String!, $context: String) {
    signIn(email: $email, context: $context) {
      phrase
    }
  }
`

const LOGOUT_USER_MUTATION = `
  mutation signOut {
    signOut
  }
`

const signIn = async ({ user: { email, ...users }, ...rest }) => {
  if (!email) return null
  await pgDatabase().public.sessions.truncate()
  await apolloFetch({
    query: LOGIN_USER_MUTATION,
    variables: {
      email,
      ...rest
    }
  })
  const { sess: { token } } = await pgDatabase().public.sessions.findOne({
    'sess @>': { email: email }
  })
  const verifyUrl = `${process.env.PUBLIC_URL}/auth/email/signin?token=${token}&email=${email}`
  try {
    await fetch(verifyUrl)
  } catch (e) {
    console.warn(e)
  }
  const { id: userId } = await pgDatabase().public.users.findOne({ email })
  return userId
}

const signOut = async () => {
  await apolloFetch({
    query: LOGOUT_USER_MUTATION
  })
  await pgDatabase().public.sessions.truncate()
  return true
}

const Unverified = {
  'firstName': 'willhelm tell',
  'lastName': 'unverified',
  'email': 'willhelmtell@project-r.construction'
}

const Member = {
  'firstName': 'willhelm tell',
  'lastName': 'member',
  'email': 'willhelmtell_member@project-r.construction'
}

const Anonymous = {
  firstName: null,
  lastName: null,
  email: null
}

module.exports = {
  signIn,
  signOut,
  Users: {
    Unverified,
    Anonymous,
    Member
  }
}
