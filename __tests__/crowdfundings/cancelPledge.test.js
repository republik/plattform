const test = require('tape-async')
const { connectIfNeeded, pgDatabase } = require('../helpers.js')
const { submitPledge } = require('./submitPledge.test.js')

const prepareNewPledge = async ({ templateId } = {}) => {
  const result = await submitPledge({
    'total': 24000,
    'options': [{
      'amount': 1,
      'price': 24000,
      templateId: templateId || '00000000-0000-0000-0008-000000000001'
    }]
  })
  return {
    pledgeId: result.data.submitPledge.pledgeId,
    userId: result.data.submitPledge.userId
  }
}

const prepare = async (options) => {
  await connectIfNeeded()
  await pgDatabase().public.payments.truncate({ cascade: true })
  await pgDatabase().public.pledgePayments.truncate({ cascade: true })
  await pgDatabase().public.pledges.truncate({ cascade: true })
  const newPledge = await prepareNewPledge(options)
  return { ...newPledge }
}

test('reclaim', async (t) => {
  const { pledgeId } = await prepare()
  t.ok(pledgeId, 'true dat')
  t.end()
})
