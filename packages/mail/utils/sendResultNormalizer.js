const sleep = require('await-sleep')

module.exports = (shouldSend, sendFunc) =>
  async () => {
    let results
    if (shouldSend) {
      try {
        results = await sendFunc()
      } catch (e) {
        console.warn('send failed', e)
        return {
          result: (results && results[0]) || null,
          status: 'FAILED',
          error: e
        }
      }
    } else {
      await sleep(250)
      return {
        result: { status: 'sent-simulated' },
        status: 'SENT'
      }
    }
    const result = results && results[0]
    const wasSent = (
      result && result.status === 'sent' && !result.reject_reason
    )
    return {
      result,
      status: wasSent
        ? 'SENT'
        : 'FAILED'
    }
  }
