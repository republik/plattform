import {
  PENDING_APP_SIGN_IN_QUERY,
  PendingAppSignInResult,
  SignInTokenType,
} from '@app/graphql/republik-api/app-sign-in'
import { getClient } from '@app/lib/apollo/client'
import { AppSignInRedirect } from './app-sign-in-redirect'
import { getUserAgentPlatformInfo } from '@app/lib/util/useragent/user-agent-plattform-information'

type VerificationURLParts = {
  tokenType: string
  token: string
  email: string
  context: string
  type: string
}

/**
 * Parse certain query parameters from the URL.
 * VerificationURL look like:
 * "https://<domain>/mitteilung?context=<context>&type=<token-type>&email=<b64-encoded-user-email>&token=<uuid>&tokenType=<token-type>",
 */
function parseVerificationURL(input: string): VerificationURLParts | null {
  try {
    const url = new URL(input)
    const tokenType = url.searchParams.get('tokenType')
    const token = url.searchParams.get('token')
    const b64Email = url.searchParams.get('email')
    const context = url.searchParams.get('context')
    const type = url.searchParams.get('type')

    return {
      tokenType,
      token,
      email: b64Email ? Buffer.from(b64Email, 'base64').toString() : '',
      context,
      type,
    }
  } catch {
    return null
  }
}

export async function AppSignIn() {
  const { isNativeApp } = getUserAgentPlatformInfo()

  if (!isNativeApp) {
    return null
  }

  const client = await getClient()
  const {
    data: { pendingAppSignIn },
  } = await client.query<PendingAppSignInResult>({
    query: PENDING_APP_SIGN_IN_QUERY,
  })

  if (!pendingAppSignIn) {
    return null
  }

  const url = parseVerificationURL(pendingAppSignIn.verificationUrl)

  if (!url.tokenType || (url.tokenType as SignInTokenType) !== 'APP') {
    return null
  }

  return (
    <AppSignInRedirect verificationURL={pendingAppSignIn.verificationUrl} />
  )
}
