const DEFAULT_ERROR = 'STRING_LENGTH_NOT_IN_SPECIFIED_RANGE'

module.exports = (unsafeString, options) => {
  const { max, min, error = DEFAULT_ERROR } = options
  const stringLength = (unsafeString || '').length
  if (Number.isInteger(max) && stringLength > max) {
    throw new Error(error)
  } else if (Number.isInteger(min) && stringLength < min) {
    throw new Error(error)
  }
}
