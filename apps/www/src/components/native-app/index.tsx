import { getPlatformInformation } from '@app/lib/util/useragent/platform-information'
import { NativeAppHandlers } from './native-app-handlers'
import { getMe } from '@app/lib/auth/me'

/**
 * Render the client side component that
 * registers the native app handlers.
 * Only required for native apps.
 */
export async function NativeAppMessageSync() {
  const { isNativeApp } = await getPlatformInformation()
  if (!isNativeApp) {
    return null
  }

  const { me } = await getMe()

  return <NativeAppHandlers me={me} />
}
