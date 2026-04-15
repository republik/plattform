import { isbot } from 'isbot'

/**
 * Parse a useragent string to retrieve the republik-app version.
 * @param value useragent string
 * @returns republik-app version or undefined if not found
 */
export function getNativeAppVersion(value: string): string | undefined {
  const matches = value?.match(/RepublikApp\/([.0-9]+)/)
  return matches ? matches[1] : undefined
}

/**
 * Parse a useragent string to retrieve the republik-app build id.
 * @param value useragent string
 * @returns build-id or undefined if not found
 */
export const getNativeAppBuildId = (value) => {
  const matches = value?.match(/RepublikApp\/([.0-9]+)\/([0-9]+)/)
  return matches ? matches[2] : undefined
}

/**
 * Parse a useragent to check if on an apple-device.
 * @param value useragent string
 * @returns boolean that says whether the useragent is from an apple-device
 */
export const matchIOSUserAgent = (value?: string): boolean =>
  !!value &&
  (!!value.match(/iPad|iPhone|iPod/) ||
    // iPad Pro in App
    // for web see https://stackoverflow.com/questions/56578799/tell-ipados-from-macos-on-the-web but that only works client side
    !!value.match(/Mac.+RepublikApp/))

/**
 * Parse a useragent-string to check if on android device
 * @param value useragent string
 * @returns boolean that says whether the useragent is from an android-device
 */
export const matchAndroidUserAgent = (value?: string): boolean =>
  !!value && !!value.match(/Android/)

/**
 * Parse a useragent-string to check if on firefox browser
 * @param value useragent string
 * @returns boolean that says whether the useragent is from a firefox browser
 */
export const matchFirefoxUserAgent = (value?: string): boolean =>
  !!value && !!value.match(/Firefox/)

/**
 * Parse a useragent-string to check if is a crawler bot
 * @param value useragent string
 * @returns boolean that says whether the useragent is a crawler bot
 */
export const matchSearchBotUserAgent = (value?: string): boolean =>
  !!value && isbot(value)
