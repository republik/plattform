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
  const { searchParams } = new URL(request.url)
  // const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const email = Buffer.from(searchParams.get('email') ?? '', 'base64').toString(
    'utf8',
  )
  const token = searchParams.get('token')
  // const next = searchParams.get('next') ?? '/'

  const redirectTo = request.nextUrl.clone()

  // TODO VALIDATE THINGS

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

    // TODO add actual redirect
    redirectTo.pathname = '/'

    redirectTo.searchParams.delete('email')
    redirectTo.searchParams.delete('token')
    redirectTo.searchParams.delete('tokenType')
    redirectTo.searchParams.delete('context')
    redirectTo.searchParams.delete('type')
    return NextResponse.redirect(redirectTo)
  } catch (e) {
    throw Error(e)
    // return NextResponse.redirect(redirectTo)
  }
}
