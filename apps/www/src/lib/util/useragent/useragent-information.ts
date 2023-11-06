import { headers } from 'next/headers'
import { getUserAgentPlatform } from './shared'

/**
 * This method allows to get the device information
 * from the useragent header in the request
 * to be used in a server-component.
 * @returns {@type ReturnType<typeof getUserAgentPlatform>}
 */
export function getDeviceInformation(): ReturnType<
  typeof getUserAgentPlatform
> {
  // get useragent header from headers
  const userAgent = headers().get('user-agent')
  // parse useragent heade

  return getUserAgentPlatform(userAgent)
}
