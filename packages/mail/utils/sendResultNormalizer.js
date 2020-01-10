const sleep = require('await-sleep')

module.exports = (shouldSchedule = false, shouldSend = true, sendFunc) =>
  async () => {
    if (shouldSchedule) {
      return {
        result: { status: 'scheduled' },
        status: 'SCHEDULED'
      }
    }

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

    if (results && typeof results === 'object' && results.status === 'error') {
      return {
        status: 'FAILED',
        error: results
      }
    }

    const result = results && results[0]
    const wasSent = !!result && result.status === 'sent' && !result.reject_reason

    return {
      result,
      status: wasSent
        ? 'SENT'
        : 'FAILED'
    }
  }
