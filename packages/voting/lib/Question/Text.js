const validate = (value, question, { t }) => {
  if (typeof value !== 'string') {
    throw new Error(t('api/questionnaire/answer/wrongType'))
  }
  if (value.length === 0) {
    return true
  }
  return false
}

module.exports = {
  validate
}
