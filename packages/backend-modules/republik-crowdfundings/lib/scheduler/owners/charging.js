const debug = require('debug')('crowdfundings:lib:scheduler:owners:charging')
const moment = require('moment')
const { ascending } = require('d3-array')

const { publish: slackPublish } = require('@orbiting/backend-modules-slack')
const { formatPrice } = require('@orbiting/backend-modules-formats')

const { prolong: autoPayProlong } = require('../../AutoPay')
const {
  getOnceForConditions,
} = require('@orbiting/backend-modules-mail/lib/mailLog')

const { SLACK_CHANNEL_AUTOPAY } = process.env

const DRY_RUN = process.env.DRY_RUN === 'true'

const formatDate = (date) => moment(date).format('YYYYMMDD')

module.exports = async (user, payload, context) => {
  const { prolongBeforeDate: anchorDate, membershipId } = user
  const { pgdb, redis, mail, t } = context

  // A list of dates after a charge attempts should be executed.
  const attempts = [
    moment(anchorDate), // T+0
    moment(anchorDate).add(1, 'days'), // T+1
    moment(anchorDate).add(3, 'days'), // T+3
    moment(anchorDate).add(7, 'days'), // T+7
  ].sort(ascending)

  // Minutes to wait before potential next attempt scheduled.
  // This is a safety measure.
  const backOffMinutes = 60 * 24 // 1 day apart

  const previousAttempts = await pgdb.public.chargeAttempts.find(
    { membershipId, 'createdAt >=': anchorDate },
    { orderBy: { createdAt: 'DESC' } },
  )

  // Back off, if attempts exceed amount of planned dates
  if (previousAttempts.length >= attempts.length) {
    debug(
      'backing off, allowed attempts exhausted, membershipId: %s',
      membershipId,
    )
    return
  }

  // Ensure was notified at least one week before
  const noticeLog = await pgdb.public.mailLog.find({
    ...getOnceForConditions({
      type: 'membership_owner_autopay_notice',
      userId: user.id,
      keys: [`endDate:${formatDate(anchorDate)}`],
    }),
    status: ['SENT', 'SCHEDULED'],
  })
  if (!noticeLog.length) {
    debug(`backing off, no notice mail found, user id: ${user.id}`)
    return
  }
  const backOffAfterNoticeDays = 7
  const waitUntilAfterNotice = moment(noticeLog[0].createdAt).add(
    backOffAfterNoticeDays,
    'days',
  )
  if (waitUntilAfterNotice > moment()) {
    debug(
      `backing off, notice mail less than ${backOffAfterNoticeDays} days, user id: ${user.id}`,
    )
    return
  }

  // Back off if last attempt failed due to PaymentIntent.authentication_required and the same paymentMethod would be used this time or was too recent
  const mostRecentAttempt = previousAttempts[0]
  if (mostRecentAttempt) {
    if (
      mostRecentAttempt.error?.raw?.code === 'authentication_required' &&
      (!mostRecentAttempt.sourceId ||
        mostRecentAttempt.sourceId === user.autoPay.sourceId)
    ) {
      debug(
        'backing off, most recent attempt failed with authentication_required and no new payment source',
      )
      return
    }

    const waitUntil = moment(mostRecentAttempt.createdAt).add(
      backOffMinutes,
      'minutes',
    )

    if (waitUntil > moment()) {
      debug(
        'backing off, most recent attempt too recent, wait until %s, membershipId: %s',
        waitUntil.toISOString(),
        membershipId,
      )
      return
    }
  }

  // Do attempt to charge if (attempt) date is after now and attempt index
  // matches amount of previous attempts.
  const doAttemptCharge = attempts.some(
    (date, index) =>
      moment().isAfter(date) && previousAttempts.length === index,
  )

  if (doAttemptCharge) {
    debug(
      'attempt to charge #%i, membershipId: %s, userId: %s',
      previousAttempts.length + 1,
      membershipId,
      user.id,
    )
    if (DRY_RUN) {
      return
    }
    const { suggestion: autoPay, chargeAttempt } = await autoPayProlong(
      membershipId,
      pgdb,
      redis,
      t,
    )

    const isLastAttempt = previousAttempts.length + 1 === attempts.length
    const payload = {
      chargeAttemptStatus: chargeAttempt.status,
      chargeAttemptError: chargeAttempt.error,
      attemptNumber: previousAttempts.length + 1,
      authenticationRequired:
        chargeAttempt.error?.raw?.code === 'authentication_required',
      isLastAttempt,
      isNextAttemptLast: previousAttempts.length + 2 === attempts.length,
      nextAttemptDate:
        !isLastAttempt &&
        moment(
          Math.max(
            moment().add(backOffMinutes, 'minutes'),
            attempts[previousAttempts.length + 1],
          ),
        ),
    }

    debug(
      chargeAttempt.status === 'SUCCESS'
        ? 'successful charge attempt #%i, membershipId: %s'
        : 'failed charge attempt #%i, membershipId: %s',
      previousAttempts.length + 1,
      membershipId,
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
            `Betrag: ${formatPrice(
              autoPay.total,
            )}, membershipId: ${membershipId}`,
            `https://admin.republik.ch/users/${autoPay.userId}`,
          ].join('\n'),
        )
      } else {
        const emoji =
          (payload.attemptNumber === 1 && ':hourglass_flowing_sand:') ||
          (payload.attemptNumber === 2 && ':hourglass_flowing_sand:') ||
          (payload.attemptNumber === 3 && ':hourglass:') ||
          ':x:'

        await slackPublish(
          SLACK_CHANNEL_AUTOPAY,
          [
            `${emoji} Fehler bei automatischer Abbuchung (${payload.attemptNumber}. Versuch):`,
            `*${chargeAttempt.error.name}: ${chargeAttempt.error.message}*`,
            `Betrag: ${formatPrice(
              autoPay.total,
            )}, membershipId: ${membershipId}`,
            `https://admin.republik.ch/users/${autoPay.userId}`,
          ].join('\n'),
        )
      }
    } catch (e) {
      console.warn(e)
    }
  }
}
