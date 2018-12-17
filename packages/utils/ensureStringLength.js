const DEFAULT_ERROR = 'STRING_LENGTH_NOT_IN_SPECIFIED_RANGE'
const DEFAULT_MIN = 1
const DEFAULT_MAX = Number.MAX_SAFE_INTEGER

module.exports = (unsafeString, options = {}) => {
  if (unsafeString === undefined || unsafeString === null || typeof unsafeString !== 'string') {
    // bail if it's not a string or no value at all
    return
  }

  const { length } = unsafeString
  const {
    max = DEFAULT_MAX,
    min = DEFAULT_MIN,
    error = DEFAULT_ERROR
  } = options

  const maxInt = parseInt(max, 10)
  const minInt = parseInt(min, 10)
  if (
    (!isNaN(maxInt) && length > maxInt) ||
    (!isNaN(minInt) && length < minInt)
  ) {
    throw new Error(error)
  }
}
