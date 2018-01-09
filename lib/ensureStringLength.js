const DEFAULT_ERROR = 'STRING_LENGTH_NOT_IN_SPECIFIED_RANGE'
const DEFAULT_MIN = 1
const DEFAULT_MAX = Number.MAX_SAFE_INTEGER

module.exports = (unsafeString, options = {}) => {
  if (unsafeString === undefined || unsafeString === null || typeof unsafeString !== 'string') {
    // bail if it's not a string
    return
  }

  const {
    max = DEFAULT_MAX,
    min = DEFAULT_MIN,
    error = DEFAULT_ERROR
  } = options

  const stringLength = (unsafeString || '').length
  if (Number.isInteger(max) && stringLength > max) {
    throw new Error(error)
  } else if (Number.isInteger(min) && stringLength < min) {
    throw new Error(error)
  }
}
