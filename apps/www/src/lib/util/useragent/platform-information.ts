import { headers } from 'next/headers'
import { parsePlatformInformation } from './shared'

/**
 * This method allows to get the device information
 * from the useragent header in the request
 * to be used in a server-component.
 * @returns {@type ReturnType<typeof parsePlatformInformation>}
 */
export function getPlatformInformation(): ReturnType<
  typeof parsePlatformInformation
> {
  // get useragent header from headers
  const userAgent = headers().get('user-agent')
  // parse useragent header
  return parsePlatformInformation(userAgent)
}
