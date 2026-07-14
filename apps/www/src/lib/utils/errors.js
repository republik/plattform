import { t } from '../withT'

export const errorToString = (error) => {
  if (error.networkError) {
    console.log(error.networkError.statusCode, error.toString())
    // Because we proxy to the backend, any status >= 500 means something's wrong there.
    if (error.networkError.statusCode >= 500) {
      return t('network-error/backend-unavailable')
    }
    if (error.toString().match(/failed/i)) {
      return t('network-error/failed')
    }
    return t('network-error/misc', {
      error: error.toString(),
    })
  }
  return error.graphQLErrors && error.graphQLErrors.length
    ? error.graphQLErrors.map((e) => e.message).join(', ')
    : error.toString()
}
