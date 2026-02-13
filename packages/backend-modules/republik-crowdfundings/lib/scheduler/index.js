const DEV = process.env.NODE_ENV ? process.env.NODE_ENV !== 'production' : true

const debug = require('debug')('crowdfundings:lib:scheduler')

const { timeScheduler } = require('@orbiting/backend-modules-schedulers')

const lockTtlSecs = 60 * 5 // 5 mins

const { inform: informGivers } = require('./givers')
const { inform: informWinback } = require('./winbacks')
const { importPayments } = require('./importPayments')
const {
  sendPaymentReminders,
} = require('../../lib/payments/paymentslip/sendPaymentReminders')

const init = async (context) => {
  debug('init')

  const schedulers = []

  schedulers.push(
    timeScheduler.init({
      name: 'import-payments',
      context,
      runFunc: importPayments,
      lockTtlSecs,
      runAtTime: '04:00', // Postfinace exports new files at around 1 AM
      runAtDaysOfWeek: [2, 3, 4, 5, 6], // Postfinance exports Tuesday to Saturday
    }),
  )

  schedulers.push(
    timeScheduler.init({
      name: 'payment-reminders',
      context,
      runFunc: (_args, context) => sendPaymentReminders(context),
      lockTtlSecs,
      runAtTime: '12:00',
    }),
  )

  schedulers.push(
    timeScheduler.init({
      name: 'memberships-givers',
      context,
      runFunc: informGivers,
      lockTtlSecs,
      runAtTime: '06:00',
      runInitially: DEV,
    }),
  )

  schedulers.push(
    timeScheduler.init({
      name: 'winback',
      context,
      runFunc: informWinback,
      lockTtlSecs,
      runAtTime: '18:32',
      runAtDaysOfWeek: [1, 2, 3, 4, 5],
      runInitially: DEV,
    }),
  )

  const close = async () => {
    for (const scheduler of schedulers) {
      await scheduler.close()
    }
  }

  return {
    close,
  }
}

module.exports = {
  init,
}
