import { getMe } from '@app/lib/auth/me'
import { AppSignInHandler } from './app-sign-in-handler'
import { getUserAgentPlatformInfo } from '@app/lib/util/useragent/user-agent-plattform-information'

/**
 * Render the client side app sign in redirect
 * component if the user is in the native app.
 */
export async function AppSignIn() {
  const { isNativeApp } = getUserAgentPlatformInfo()
  if (!isNativeApp) {
    return null
  }

  const me = await getMe()
  if (me) {
    return null
  }

  return <AppSignInHandler />
}
