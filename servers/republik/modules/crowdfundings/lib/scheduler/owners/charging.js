const debug = require('debug')('crowdfundings:lib:scheduler:owners:charging')
const moment = require('moment')
const { ascending } = require('d3-array')

const { publish: slackPublish } = require('@orbiting/backend-modules-slack')
const { formatPrice } = require('@orbiting/backend-modules-formats')

const { prolong: autoPayProlong } = require('../../AutoPay')

const { SLACK_CHANNEL_AUTOPAY } = process.env

module.exports = async (user, bucket, context) => {
  const { pgdb, redis, mail, t } = context

  const anchorDate = user.prolongBeforeDate
  const { membershipId } = user.user

  // A list of dates after a charge attempts should be executed.
  const attempts = [
    moment(user.prolongBeforeDate), // T+0
    moment(user.prolongBeforeDate).add(1, 'days'), // T+1
    moment(user.prolongBeforeDate).add(3, 'days'), // T+3
    moment(user.prolongBeforeDate).add(7, 'days') // T+7
  ].sort(ascending)

  // Minutes to wait before potential next attempt scheduled.
  // This is a safety measure.
  const backOffMinutes = 60 * 24 // 1 day apart

  const previousAttempts = await pgdb.public.chargeAttempts.find(
    { membershipId, 'createdAt >=': anchorDate },
    { orderBy: { createdAt: 'DESC' } }
  )

  // Back off, if attempts exceed amount of planned dates
  if (previousAttempts.length >= attempts.length) {
    debug('backing off, allowed attempts exhausted, membershipId: %s', membershipId)
    return
  }

  // Back off if last attempt was too recent
  const mostRecentAttempt = previousAttempts[0]
  if (mostRecentAttempt) {
    const waitUntil = moment(mostRecentAttempt.createdAt).add(backOffMinutes, 'minutes')

    if (waitUntil > moment()) {
      debug(
        'backing off, most recent attempt too recent, wait until %s, membershipId: %s',
        waitUntil.toISOString(),
        membershipId
      )
      return
    }
  }

  // Do attempt to charge if (attempt) date is after now and attempt index
  // matches amount of previous attempts.
  const doAttemptCharge = attempts.some((date, index) => moment().isAfter(date) && previousAttempts.length === index)

  if (doAttemptCharge) {
    debug('attempt to charge #%i, membershipId: %s', previousAttempts.length + 1, membershipId)
    const { suggestion: autoPay, chargeAttempt } = await autoPayProlong(membershipId, pgdb, redis)

    const isNextAttemptLast = previousAttempts.length + 2 === attempts.length
    const payload = {
      chargeAttemptStatus: chargeAttempt.status,
      attemptNumber: previousAttempts.length + 1,
      isLastAttempt: previousAttempts.length + 1 === attempts.length,
      isNextAttemptLast,
      nextAttemptDate: !isNextAttemptLast && moment(Math.max(
        moment().add(backOffMinutes, 'minutes'),
        attempts[previousAttempts.length + 1]
      ))
    }

    debug(
      chargeAttempt.status === 'SUCCESS'
        ? 'successful charge attempt #%i, membershipId: %s'
        : 'failed charge attempt #%i, membershipId: %s',
      previousAttempts.length + 1,
      membershipId
    )

    try {
      await mail.sendMembershipOwnerAutoPay({ autoPay, payload, pgdb, t })
    } catch (e) {
      console.warn(e)
    }

    try {
      if (chargeAttempt.status === 'SUCCESS') {
        await slackPublish(
          SLACK_CHANNEL_AUTOPAY,
          [
            `:white_check_mark: Automatische Abbuchung erfolgreich (${payload.attemptNumber}. Versuch):`,
            `Betrag: ${formatPrice(autoPay.total)}, membershipId: ${membershipId}`,
            `https://admin.republik.ch/users/${autoPay.userId}`
          ].join('\n')
        )
      } else {
        await slackPublish(
          SLACK_CHANNEL_AUTOPAY,
          [
            `:x: Fehler bei automatischer Abbuchung (${payload.attemptNumber}. Versuch):`,
            `*${chargeAttempt.error.name}: ${chargeAttempt.error.message}*`,
            `Betrag: ${formatPrice(autoPay.total)}, membershipId: ${membershipId}`,
            `https://admin.republik.ch/users/${autoPay.userId}`
          ].join('\n')
        )
      }
    } catch (e) {
      console.warn(e)
    }
  }
}
