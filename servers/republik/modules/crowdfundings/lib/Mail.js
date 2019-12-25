const debug = require('debug')('crowdfundings:lib:Mail')
const moment = require('moment')
const { ascending, descending } = require('d3-array')

const { createMail, sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { grants } = require('@orbiting/backend-modules-access')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const { timeFormat, formatPriceChf } =
  require('@orbiting/backend-modules-formats')

const { getLastEndDate } = require('./utils')
const { count: memberStatsCount } = require('../../../lib/memberStats')

const dateFormat = timeFormat('%x')

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
  FRONTEND_BASE_URL
} = process.env

const mail = createMail([
  {
    name: 'DAILY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
    roles: ['member']
  },
  {
    name: 'WEEKLY',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
    roles: ['member']
  },
  {
    name: 'PROJECTR',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR,
    roles: []
  }
])

const getInterestsForUser = async ({
  userId,
  subscribeToEditorialNewsletters,
  pgdb
}) => {
  const pledges = !!userId && await pgdb.public.pledges.find({
    userId,
    status: 'SUCCESSFUL'
  })
  const hasPledge = (!!pledges && pledges.length > 0)

  const hasMembership = !!userId && !!(await pgdb.public.memberships.findFirst({
    userId,
    active: true
  }))

  const membershipTypeBenefactor = await pgdb.public.membershipTypes.findOne({
    name: 'BENEFACTOR_ABO'
  })
  const isBenefactor = !!userId && membershipTypeBenefactor ? !!(await pgdb.public.memberships.findFirst({
    userId,
    membershipTypeId: membershipTypeBenefactor.id
  })) : false

  const user = !!userId && await pgdb.public.users.findOne({ id: userId })
  const accessGrants = !!user && await grants.findByRecipient(user, { pgdb })
  const hasGrantedAccess = !!user && !!accessGrants && accessGrants.length > 0

  debug({
    hasPledge,
    hasMembership,
    isBenefactor,
    hasGrantedAccess
  })

  // Update the membership type interests on mailchimp
  const interests = {
    [MAILCHIMP_INTEREST_PLEDGE]: hasPledge,
    [MAILCHIMP_INTEREST_MEMBER]: hasMembership,
    [MAILCHIMP_INTEREST_MEMBER_BENEFACTOR]: isBenefactor,
    [MAILCHIMP_INTEREST_GRANTED_ACCESS]: hasGrantedAccess
  }

  if (
    subscribeToEditorialNewsletters &&
    (hasMembership || hasGrantedAccess)
  ) {
    // Autosubscribe all newsletters when new user just paid the membersh.
    interests[MAILCHIMP_INTEREST_NEWSLETTER_DAILY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY] = true
    interests[MAILCHIMP_INTEREST_NEWSLETTER_PROJECTR] = true
  }

  return interests
}

mail.getInterestsForUser = getInterestsForUser

mail.enforceSubscriptions = async ({
  userId,
  email,
  subscribeToEditorialNewsletters,
  pgdb,
  ...rest
}) => {
  const user = !!userId && await pgdb.public.users.findOne({ id: userId })

  const interests = await getInterestsForUser({
    userId: !!user && user.id,
    subscribeToEditorialNewsletters,
    pgdb
  })

  const sanitizedUser = user || { email, roles: [] }
  return mail.updateNewsletterSubscriptions({ user: sanitizedUser, interests, ...rest })
}

mail.sendMembershipProlongConfirmation = async ({
  pledger,
  membership,
  additionalPeriods,
  t,
  pgdb
}) => {
  const safePledger = transformUser(pledger)
  const safeMembershipUser = transformUser(membership.user)

  await sendMailTemplate({
    to: membership.user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t(
      'api/email/membership_prolong_notice/subject'
    ),
    templateName: 'membership_prolong_notice',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: safeMembershipUser.name
      },
      {
        name: 'pledger_name',
        content: safePledger.name
      },
      {
        name: 'end_date',
        content: dateFormat(getLastEndDate(additionalPeriods))
      }
    ]
  }, { pgdb })
}

mail.sendPledgeConfirmations = async ({ userId, pgdb, t }) => {
  const user = await pgdb.public.users.findOne({ id: userId })
  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    'status !=': 'CANCELLED',
    sendConfirmMail: true
  })

  if (!pledges.length) { return }

  await Promise.all(pledges.map(async (pledge) => {
    const package_ = await pgdb.public.packages.findOne({
      id: pledge.packageId
    })

    const templateName = `pledge_${package_.name.toLowerCase()}`

    return sendMailTemplate({
      to: user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars: await mail.getPledgeMergeVars(
        { pledge, user, package_ }, { pgdb, t }
      )
    }, { pgdb })
  }))

  await pgdb.public.pledges.update({ id: pledges.map(pledge => pledge.id) }, {
    sendConfirmMail: false
  })
}

mail.sendPaymentSuccessful = async ({ pledgeId, pgdb, t }) => {
  const pledge = await pgdb.public.pledges.findOne({ id: pledgeId })
  const user = await pgdb.public.users.findOne({ id: pledge.userId })
  const package_ = await pgdb.public.packages.findOne({ id: pledge.packageId })

  const templateName = `payment_successful_${package_.name.toLowerCase()}`

  return sendMailTemplate({
    to: user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t(`api/email/${templateName}/subject`),
    templateName,
    mergeLanguage: 'handlebars',
    globalMergeVars: await mail.getPledgeMergeVars(
      { pledge, user, package_ }, { pgdb, t }
    )
  }, { pgdb })
}

mail.sendMembershipCancellation = async ({ email, name, endDate, membershipType, reasonGiven, t, pgdb }) => {
  return sendMailTemplate({
    to: email,
    subject: t('api/email/membership_cancel_notice/subject'),
    templateName: 'membership_cancel_notice',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: name
      },
      {
        name: 'end_date',
        content: dateFormat(endDate)
      },
      {
        name: 'membership_type',
        content: membershipType.name
      },
      {
        name: 'reason_given',
        content: !!reasonGiven
      }
    ]
  }, { pgdb })
}

mail.sendMembershipDeactivated = async ({ membership, pgdb, t }) => {
  const user = await pgdb.public.users.findOne({ id: membership.userId })
  const type = await pgdb.public.membershipTypes.findOne({ id: membership.membershipTypeId })

  const cancelState = membership.renew ? 'uncancelled' : 'cancelled'
  const templateName = `membership_deactivated_${type.name.toLowerCase()}_${cancelState}`
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')
  const sequenceNumber = membership.sequenceNumber

  return sendMailTemplate({
    to: user.email,
    subject: t.first([
      `api/email/${templateName}/sequenceNumber/${!!sequenceNumber}/subject`,
      `api/email/${templateName}/subject`,
      'api/email/membership_deactivated/subject'
    ], { sequenceNumber }),
    templateName,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`
      },
      {
        name: 'sequence_number',
        content: sequenceNumber
      }
    ]
  }, { pgdb })
}

mail.prepareMembershipGiversProlongNotice = async ({ userId, membershipIds, informClaimersDays }, { t, pgdb }) => {
  const user = transformUser(
    await pgdb.public.users.findOne({ id: userId })
  )
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  const memberships = await pgdb.public.memberships.find({
    id: membershipIds
  })

  const membershipsUsers =
    memberships.length > 0
      ? await pgdb.public.users.find(
        { id: memberships.map(m => m.userId) }
      )
      : []

  memberships.forEach((membership, index, memberships) => {
    memberships[index].user =
      membershipsUsers.find(u => u.id === membership.userId)
  })

  return ({
    to: user.email,
    subject: t('api/email/membership_giver_prolong_notice/subject'),
    templateName: 'membership_giver_prolong_notice',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: user.name
      },
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&membershipIds=${membershipIds.join('~')}&token=${customPledgeToken}`
      },
      {
        name: 'gifted_memberships_count',
        content: memberships.length
      },
      {
        name: 'inform_claimers_days',
        content: informClaimersDays
      },
      {
        name: 'options',
        content: memberships
          .map(membership => {
            const olabel =
              t('api/email/option/other/gifted_membership', {
                name: transformUser(membership.user).name,
                sequenceNumber: membership.sequenceNumber
              })
            return { olabel }
          })
      }
    ]
  })
}

mail.prepareMembershipWinback = async ({ userId, cancellationCategory, cancelledAt }, { t, pgdb }) => {
  const user = transformUser(
    await pgdb.public.users.findOne({ id: userId })
  )
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  return ({
    to: user.email,
    subject: t.first([
      `api/email/membership_winback_${cancellationCategory}/subject`,
      'api/email/membership_winback/subject'
    ]),
    templateName: `membership_winback_${cancellationCategory}`,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: user.name
      },
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`
      },
      {
        name: 'prolong_url_reduced',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}&userPrice=1`
      },
      {
        name: 'cancelled_at',
        content: dateFormat(cancelledAt)
      }
    ]
  })
}

mail.prepareMembershipOwnerNotice = async ({ user, endDate, graceEndDate, cancelUntilDate, templateName }, { pgdb, t }) => {
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  const formattedEndDate = dateFormat(endDate)
  const formattedGraceEndDate = dateFormat(graceEndDate)

  const timeLeft = moment(endDate).startOf('day').diff(moment().startOf('day'))
  const daysLeft = Math.max(1, Math.ceil(moment.duration(timeLeft).as('days')))

  const membershipId = user.membershipId || false
  const sequenceNumber = user.membershipSequenceNumber || false

  const autoPay = user.autoPay

  return ({
    to: user.email,
    subject: t.first([
      `api/email/${templateName}/sequenceNumber/${!!sequenceNumber}/subject`,
      `api/email/${templateName}/subject`
    ], {
      endDate: formattedEndDate,
      sequenceNumber
    }),
    templateName,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: user.name
      },
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`
      },
      {
        name: 'cockpit_url',
        content: `${FRONTEND_BASE_URL}/angebote?goto=cockpit&token=${customPledgeToken}`
      },
      {
        name: 'cancel_url',
        content: membershipId
          ? `${FRONTEND_BASE_URL}/abgang?membershipId=${membershipId}`
          : `${FRONTEND_BASE_URL}/konto#abos`
      },
      {
        name: 'end_date',
        content: formattedEndDate
      },
      {
        name: 'grace_end_date',
        content: formattedGraceEndDate
      },
      {
        name: 'days_left',
        content: daysLeft
      },
      {
        name: 'cancel_until_date',
        content: dateFormat(cancelUntilDate)
      },
      {
        name: 'sequence_number',
        content: sequenceNumber
      },
      autoPay && autoPay.membershipType && {
        name: 'autopay_membership_type',
        content: autoPay.membershipType
      },
      autoPay && autoPay.withDiscount && {
        name: 'autopay_with_discount',
        content: autoPay.withDiscount
      },
      autoPay && autoPay.withDonation && {
        name: 'autopay_with_donation',
        content: autoPay.withDonation
      },
      autoPay && autoPay.defaultPrice && {
        name: 'autopay_default_price',
        content: formatPriceChf(autoPay.defaultPrice / 100)
      },
      autoPay && autoPay.total && {
        name: 'autopay_total',
        content: formatPriceChf(autoPay.total / 100)
      },
      autoPay && autoPay.card && {
        name: 'autopay_card_brand',
        content: autoPay.card.brand
      },
      autoPay && autoPay.card && {
        name: 'autopay_card_last4',
        content: autoPay.card.last4
      }
    ]
  })
}

mail.sendMembershipOwnerAutoPay = async ({ autoPay, payload, pgdb, t }) => {
  const user = await pgdb.public.users.findOne({ id: autoPay.userId })
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')
  const version = payload.chargeAttemptStatus === 'SUCCESS' ? 'successful' : 'failed'
  const templateName = `membership_owner_autopay_${version}`
  const subject = t.first([
    `api/email/${templateName}_${payload.attemptNumber}/subject`,
    `api/email/${templateName}/subject`
  ])

  return sendMailTemplate({
    to: user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject,
    templateName,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`
      },
      {
        name: 'prolong_url_reduced',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}&userPrice=1`
      },
      {
        name: 'end_date',
        content: dateFormat(autoPay.endDate)
      },
      {
        name: 'grace_end_date',
        content: dateFormat(autoPay.graceEndDate)
      },
      {
        name: 'prolonged_end_date',
        content: dateFormat(autoPay.prolongedEndDate)
      },
      {
        name: 'autopay_total',
        content: formatPriceChf(autoPay.total / 100)
      },
      autoPay.card && {
        name: 'autopay_card_brand',
        content: autoPay.card.brand
      },
      autoPay.card && {
        name: 'autopay_card_last4',
        content: autoPay.card.last4
      },
      {
        name: 'attempt_number',
        content: payload.attemptNumber
      },
      {
        name: 'attempt_is_last',
        content: payload.isLastAttempt
      },
      {
        name: 'attempt_next_is_last',
        content: payload.isNextAttemptLast
      },
      !payload.isLastAttempt && payload.nextAttemptDate && {
        name: 'attempt_next_at',
        content: dateFormat(payload.nextAttemptDate)
      }
    ]
  }, { pgdb })
}

/**
 * Attempts to fetch a pledge and related data, and generates a series of merge
 * variables.
 */
mail.getPledgeMergeVars = async (
  { pledge, user = false, package_ = false },
  { pgdb, t }
) => {
  if (!user) {
    user = await pgdb.public.users.findOne({ id: pledge.userId })
  }

  if (!package_) {
    package_ = await pgdb.public.packages.findOne({ id: pledge.packageId })
  }

  const pledgePayment = await pgdb.public.pledgePayments.findFirst(
    { pledgeId: pledge.id },
    { orderBy: ['createdAt desc'] }
  )
  const payment = pledgePayment
    ? await pgdb.public.payments.findOne({ id: pledgePayment.paymentId })
    : {}

  const pledgeOptions = await pgdb.public.pledgeOptions.find({
    pledgeId: pledge.id,
    'amount >': 0
  }, {
    orderBy: ['amount desc']
  })

  const packageOptions = await pgdb.public.packageOptions.find({
    id: pledgeOptions.map(o => o.templateId)
  })

  const rewardGoodies = await pgdb.public.goodies.find({
    rewardId: packageOptions.map(o => o.rewardId)
  })

  const rewardMembershipTypes = await pgdb.public.membershipTypes.find({
    rewardId: packageOptions.map(o => o.rewardId)
  })

  const rewards = rewardGoodies.concat(rewardMembershipTypes)

  packageOptions.forEach((packageOption, index, packageOptions) => {
    packageOptions[index].reward = rewards
      .find(r => r.rewardId === packageOption.rewardId)
  })

  // Find membership IDs mentoned in pledgeOption.membershipId
  const pledgedMemberships = pledgeOptions
    .map(pledgeOption => pledgeOption.membershipId)
    .filter(Boolean)

  // All affected memberships. These are memberships that spring from this
  // pledge, or memberships that were mentioned pledgeOption.membershipId.
  const memberships = await pgdb.public.memberships.find({
    or: [
      { pledgeId: pledge.id },
      pledgedMemberships.length > 0 && { id: pledgedMemberships }
    ].filter(Boolean)
  })

  const membershipsUsers =
    memberships.length > 0
      ? await pgdb.public.users.find(
        { id: memberships.map(m => m.userId) }
      )
      : []

  memberships.forEach((membership, index, memberships) => {
    memberships[index].user =
      membershipsUsers.find(u => u.id === membership.userId)
  })

  pledgeOptions.forEach((pledgeOption, index, pledgeOptions) => {
    pledgeOptions[index].packageOption = packageOptions
      .find(o => o.id === pledgeOption.templateId)

    if (pledgeOption.membershipId) {
      pledgeOptions[index].membership = memberships
        .find(m => m.id === pledgeOption.membershipId)
    }
  })

  pledgeOptions
    // Sort by price
    .sort((a, b) => descending(a.price, b.price))
    // Sort by sequenceNumber in an ascending manner
    .sort((a, b) => ascending(
      a.membership && a.membership.sequenceNumber,
      b.membership && b.membership.sequenceNumber
    ))
    // Sort by userID, own ones up top.
    .sort((a, b) => descending(
      a.membership && a.membership.userId === user.id,
      b.membership && b.membership.userId === user.id
    ))
    // Sort by packageOption.order in an ascending manner
    .sort((a, b) => ascending(
      a.packageOption && a.packageOption.order,
      b.packageOption && b.packageOption.order
    ))

  const pledgerMemberships = memberships
    .filter(membership => pledge.userId === membership.userId)

  const giftedMemberships = memberships
    .filter(membership => pledge.userId !== membership.userId)

  const address = await pgdb.public.addresses.findOne({ id: user.addressId })

  const discount = pledge.donation < 0 ? (0 - pledge.donation) / 100 : 0
  const donation = pledge.donation > 0 ? pledge.donation / 100 : 0
  const total = pledge.total / 100

  const hasGoodies = rewardGoodies.map(goodie => {
    return {
      name: `goodies_has_${goodie.name.toLowerCase()}`,
      content: !!pledgeOptions
        .filter(
          pledgeOption =>
            pledgeOption.packageOption.reward &&
            pledgeOption.packageOption.reward.name === goodie.name &&
            pledgeOption.amount > 0
        )
        .length
    }
  })

  return [
    // Purchase itself
    {
      name: 'options',
      content: pledgeOptions
        // Filter "pseudo" pledge options without a reward
        .filter(pledgeOption => pledgeOption.packageOption.reward)
        .map(pledgeOption => {
          const { rewardType, name } = pledgeOption.packageOption.reward

          const isGiftedMembership =
            pledgeOption.membership &&
            pledgeOption.membership.userId !== pledge.userId

          const labelFragmentInterval = t.pluralize(
            `api/email/option/interval/${pledgeOption.packageOption.reward.interval}/periods`,
            { count: pledgeOption.periods })

          const labelDefault = t.pluralize(
            `api/email/option/${rewardType.toLowerCase()}/${name.toLowerCase()}`,
            { count: pledgeOption.amount, interval: labelFragmentInterval }
          )

          const labelGiftedMembership = t(
            'api/email/option/other/gifted_membership',
            {
              name: pledgeOption.membership &&
                transformUser(pledgeOption.membership.user).name,
              sequenceNumber: pledgeOption.membership &&
                pledgeOption.membership.sequenceNumber
            }
          )

          const oprice =
            (pledgeOption.price * (pledgeOption.periods || 1)) / 100
          const ototal =
            oprice * pledgeOption.amount

          return {
            oamount: pledgeOption.amount,
            otype: rewardType,
            oname: name,
            olabel: !isGiftedMembership
              ? labelDefault
              : labelGiftedMembership,
            oprice,
            oprice_formatted: formatPriceChf(oprice),
            ototal,
            ototal_formatted: formatPriceChf(ototal)
          }
        })
    },
    {
      name: 'discount',
      content: discount
    },
    {
      name: 'discount_formatted',
      content: formatPriceChf(discount)
    },
    {
      name: 'donation',
      content: donation
    },
    {
      name: 'donation_formatted',
      content: formatPriceChf(donation)
    },
    {
      name: 'total',
      content: total
    },
    {
      name: 'total_formatted',
      content: formatPriceChf(total)
    },

    // Payment
    {
      name: 'payment_method',
      content: payment.method
    },
    ...payment
      ? [
        {
          name: 'HRID',
          content: payment.hrid
        },
        {
          name: 'due_date',
          content: dateFormat(payment.dueDate)
        },
        {
          name: 'paymentslip',
          content: payment.method === 'PAYMENTSLIP'
        },
        {
          name: 'not_paymentslip',
          content: payment.method !== 'PAYMENTSLIP'
        }
      ]
      : [],
    {
      name: 'waiting_for_payment',
      content: pledge.status === 'WAITING_FOR_PAYMENT'
    },

    // Helpers
    {
      name: 'name',
      content: [user.firstName, user.lastName]
        .filter(Boolean)
        .join(' ')
        .trim()
    },
    {
      name: 'voucher_codes',
      content: ['ABO_GIVE', 'ABO_GIVE_MONTHS'].includes(package_.name)
        ? memberships.map(m => m.voucherCode).join(', ')
        : null
    },
    {
      name: 'goodies_count',
      content: pledgeOptions
        // Filter "pseudo" pledge options without a reward
        .filter(
          pledgeOption =>
            pledgeOption.packageOption.reward &&
            pledgeOption.packageOption.reward.rewardType === 'Goodie'
        )
        .reduce((agg, pledgeOption) => agg + pledgeOption.amount, 0)
    },
    ...hasGoodies, // goodies_has_[goodies.name]
    {
      name: 'address',
      content: address
        ? `<span>${address.name}<br/>
  ${address.line1}<br/>
  ${address.line2 ? address.line2 + '<br/>' : ''}
  ${address.postalCode} ${address.city}<br/>
  ${address.country}</span>`
        : null
    },
    {
      name: 'pledger_memberships_count',
      content: pledgerMemberships.length
    },
    {
      name: 'gifted_memberships_count',
      content: giftedMemberships.length
    },
    {
      name: 'republik_memberships_count',
      content: await memberStatsCount({ pgdb })
    },
    {
      name: 'link_claim',
      content: `${FRONTEND_BASE_URL}/abholen`
    }
  ]
}

module.exports = mail
