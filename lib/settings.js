const ENV =
  typeof window !== 'undefined'
    ? window.__NEXT_DATA__.env
    : process.env

export const LOCALE = ENV.LOCALE
export const API_BASE_URL = ENV.API_BASE_URL
export const API_WS_BASE_URL = ENV.API_WS_BASE_URL
export const API_AUTHORIZATION_HEADER = ENV.API_AUTHORIZATION_HEADER

export { default as routes } from '../server/routes'
