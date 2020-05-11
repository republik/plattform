const getTemplate = record => record.info && record.info.template

const getSubject = record => record.info && record.info.message && record.info.message.subject

const getStatus = record =>
  (record.mandrillLastEvent && record.mandrillLastEvent.msg.state) ||
  (record.result && record.result.status) ||
  record.status.toLowerCase()

const getError = record =>
  (record.mandrillLastEvent && record.mandrillLastEvent.msg && record.mandrillLastEvent.msg.diag) ||
  (record.mandrillLastEvent && record.mandrillLastEvent.msg && record.mandrillLastEvent.msg.bounce_description) ||
  (record.result && record.result.reject_reason) ||
  (record.result && record.result.error) ||
  (record.error && record.error.message) ||
  (record.error && record.error.meta && record.error.meta.error && record.error.meta.error.type) ||
  (record.error && record.error.meta && record.error.meta.response)

module.exports = {
  getTemplate,
  getSubject,
  getStatus,
  getError
}
