const fetch = require('node-fetch')
const { apolloFetch, pgDatabase } = require('./helpers')

const LOGIN_USER_MUTATION = `
  mutation signIn($email: String!, $context: String) {
    signIn(email: $email, context: $context) {
      phrase
    }
  }
`

const signIn = async ({ user: { email, ...users }, ...rest }) => {
  pgDatabase().public.sessions.truncate()
  await apolloFetch({
    query: LOGIN_USER_MUTATION,
    variables: {
      email,
      ...rest
    }
  })
  const { sess } = await pgDatabase().public.sessions.findOne({
    'sess @>': { email: email }
  })
  const verifyUrl = `${process.env.PUBLIC_URL}/auth/email/signin?token=${sess.token}&email=${email}`
  console.log(verifyUrl)
  try {
    await fetch(verifyUrl)
  } catch (e) {
    console.log(e)
  }
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

const Anonymous = null

module.exports = {
  signIn,
  Users: {
    Unverified,
    Anonymous,
    Member
  }
}
