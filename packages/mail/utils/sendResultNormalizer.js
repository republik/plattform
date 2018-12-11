const sleep = require('await-sleep')

module.exports = (shouldSend, sendFunc) =>
  async () => {
    let results, error
    if (shouldSend) {
      try {
        results = await sendFunc()
      } catch (e) {
        error = e
        console.warn('send failed', error)
        return {
          result: (results && results[0]) || null,
          status: 'FAILED',
          error
        }
      }
    } else {
      await sleep(250)
      results = [{ status: 'sent-simulated' }]
    }
    const result = results && results[0]
    const wasSent = (
      result && !error && (
        (result.status === 'sent' || result.status === 'sent-simulated') &&
        !result.reject_reason
      )
    )
    return {
      result,
      status: wasSent
        ? 'SENT'
        : 'FAILED'
    }
  }
