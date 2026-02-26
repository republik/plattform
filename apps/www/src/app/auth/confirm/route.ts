import {
  AuthorizeSessionDocument,
  SignInTokenType,
  UnauthorizedSessionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { getClient } from '@app/lib/apollo/client'
import { NextResponse, type NextRequest } from 'next/server'

// TODO: add more types
type EmailOtpType = 'token-authorization'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  // const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const email = Buffer.from(searchParams.get('email') ?? '', 'base64').toString(
    'utf8',
  )
  const token = searchParams.get('token')

  // Use context param for redirect whoop
  const context = searchParams.get('context')

  let redirectTo: URL
  try {
    // TODO: validate context as URL/pathname
    redirectTo = new URL(context ?? '/', request.nextUrl)
  } catch (e) {
    redirectTo = new URL('/', request.nextUrl)
  }

  const gqlClient = getClient()

  try {
    const { data } = await gqlClient.query({
      query: UnauthorizedSessionDocument,
      variables: {
        email,
        token,
        tokenType: SignInTokenType.EmailToken,
      },
    })

    // If not the current session, show confirm dialog
    if (!data.unauthorizedSession.session.isCurrent) {
      // TODO: make a new dialog
      redirectTo.pathname = '/mitteilung'
      return NextResponse.redirect(redirectTo)
    }

    // If current session, just authorize and redirect to target
    await gqlClient.mutate({
      mutation: AuthorizeSessionDocument,
      variables: {
        email,
        tokens: [{ type: SignInTokenType.EmailToken, payload: token }],
      },
    })

    return NextResponse.redirect(redirectTo)
  } catch (e) {
    throw Error(e)
    // return NextResponse.redirect(redirectTo)
  }
}

export async function POST(request: NextRequest) {
  const fd = await request.formData()

  const email = Buffer.from(
    (fd.get('email') as string) ?? '',
    'base64',
  ).toString('utf8')

  const token = fd.get('token') as string

  const gqlClient = getClient()

  await gqlClient.mutate({
    mutation: AuthorizeSessionDocument,
    variables: {
      email,
      tokens: [{ type: SignInTokenType.EmailToken, payload: token }],
    },
  })

  return NextResponse.redirect(new URL('/auth/confirm-ok', request.nextUrl))
}
