import { t } from '../withT'

export const errorToString = (error) => {
  if (error.networkError) {
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
