const moment = require('moment')
const { ascending, descending } = require('d3-array')

const {
  createMail,
  sendMailTemplate,
} = require('@orbiting/backend-modules-mail')
const { transformUser, AccessToken } = require('@orbiting/backend-modules-auth')
const {
  timeFormat,
  formatPriceChf,
} = require('@orbiting/backend-modules-formats')
const invoices = require('@orbiting/backend-modules-invoices')

const { getLastEndDate, getMembershipCompany } = require('./utils')

const dateFormat = timeFormat('%x')

const {
  getSegmentDataForUser,
  getInterestsForUser,
  isUserInAudience,
  addUserToAudience,
  addUserToMarketingAudience,
  archiveMemberInAudience,
  NewsletterSubscriptionConfig,
  enforceSubscriptions,
  resubscribeEmail,
} = require('@orbiting/backend-modules-mailchimp')

const { FRONTEND_BASE_URL } = process.env

const mail = createMail(NewsletterSubscriptionConfig)

mail.getSegmentDataForUser = getSegmentDataForUser
mail.getInterestsForUser = getInterestsForUser
mail.isUserInAudience = isUserInAudience
mail.addUserToMarketingAudience = addUserToMarketingAudience
mail.addUserToAudience = addUserToAudience
mail.archiveMemberInAudience = archiveMemberInAudience
mail.enforceSubscriptions = enforceSubscriptions
mail.resubscribeEmail = resubscribeEmail

mail.sendMembershipProlongConfirmation = async ({
  pledger,
  membership,
  additionalPeriods,
  t,
  pgdb,
}) => {
  const safePledger = transformUser(pledger)
  const safeMembershipUser = transformUser(membership.user)

  await sendMailTemplate(
    {
      to: membership.user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/email/membership_prolong_notice/subject'),
      templateName: 'membership_prolong_notice',
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        {
          name: 'name',
          content: safeMembershipUser.name,
        },
        {
          name: 'pledger_name',
          content: safePledger.name,
        },
        {
          name: 'end_date',
          content: dateFormat(getLastEndDate(additionalPeriods)),
        },
      ],
    },
    { pgdb },
  )
}

mail.sendPledgeConfirmations = async ({ userId, pgdb, t }) => {
  const user = await pgdb.public.users.findOne({
    id: userId,
    verified: true,
  })
  if (!user) {
    return
  }

  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    'status !=': 'CANCELLED',
    sendConfirmMail: true,
  })
  if (!pledges.length) {
    return
  }

  await Promise.all(
    pledges.map(async (pledge) => {
      const package_ = await pgdb.public.packages.findOne({
        id: pledge.packageId,
      })

      const templateName = `pledge_${package_.name.toLowerCase()}`

      const pledgeMergeVars = await mail.getPledgeMergeVars(
        { pledge, user, package_ },
        { pgdb, t },
      )

      const globalMergeVars = pledgeMergeVars.filter((v) => !v.type)
      const attachments = pledgeMergeVars.filter((v) => !!v.type)

      return sendMailTemplate(
        {
          to: user.email,
          fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
          subject: t(`api/email/${templateName}/subject`),
          templateName,
          mergeLanguage: 'handlebars',
          globalMergeVars,
          attachments,
        },
        { pgdb },
      )
    }),
  )

  await pgdb.public.pledges.update(
    { id: pledges.map((pledge) => pledge.id) },
    {
      sendConfirmMail: false,
    },
  )
}

mail.sendPaymentSuccessful = async ({ pledgeId, pgdb, t }) => {
  const pledge = await pgdb.public.pledges.findOne({ id: pledgeId })
  const user = await pgdb.public.users.findOne({ id: pledge.userId })
  const package_ = await pgdb.public.packages.findOne({ id: pledge.packageId })

  const templateName = `payment_successful_${package_.name.toLowerCase()}`

  const pledgeMergeVars = await mail.getPledgeMergeVars(
    { pledge, user, package_ },
    { pgdb, t },
  )

  const globalMergeVars = pledgeMergeVars.filter((v) => !v.type)

  return sendMailTemplate(
    {
      to: user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars,
    },
    { pgdb },
  )
}

mail.sendMembershipCancellation = async ({
  email,
  name,
  endDate,
  active,
  membershipType,
  reasonGiven,
  t,
  pgdb,
}) => {
  return sendMailTemplate(
    {
      to: email,
      subject: t('api/email/membership_cancel_notice/subject'),
      templateName: 'membership_cancel_notice',
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        {
          name: 'name',
          content: name,
        },
        {
          name: 'end_date',
          content: dateFormat(endDate),
        },
        {
          name: 'membership_active',
          content: active,
        },
        {
          name: 'membership_type',
          content: membershipType.name,
        },
        {
          name: 'reason_given',
          content: !!reasonGiven,
        },
      ],
    },
    { pgdb },
  )
}

mail.sendMembershipDeactivated = async ({ membership, pgdb, t }) => {
  const user = await pgdb.public.users.findOne({ id: membership.userId })
  const type = await pgdb.public.membershipTypes.findOne({
    id: membership.membershipTypeId,
  })

  const cancelState = membership.renew ? 'uncancelled' : 'cancelled'
  const templateName = `membership_deactivated_${type.name.toLowerCase()}_${cancelState}`
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')
  const sequenceNumber = membership.sequenceNumber

  return sendMailTemplate(
    {
      to: user.email,
      subject: t.first(
        [
          `api/email/${templateName}/sequenceNumber/${!!sequenceNumber}/subject`,
          `api/email/${templateName}/subject`,
          'api/email/membership_deactivated/subject',
        ],
        { sequenceNumber },
      ),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        {
          name: 'name',
          content: user.name,
        },
        {
          name: 'prolong_url',
          content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`,
        },
        {
          name: 'sequence_number',
          content: sequenceNumber,
        },
      ],
    },
    { pgdb },
  )
}

mail.prepareMembershipGiversProlongNotice = async (
  { userId, membershipIds, informClaimersDays },
  { t, pgdb },
) => {
  const user = transformUser(await pgdb.public.users.findOne({ id: userId }))
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  const memberships = await pgdb.public.memberships.find({
    id: membershipIds,
  })

  const membershipsUsers =
    memberships.length > 0
      ? await pgdb.public.users.find({ id: memberships.map((m) => m.userId) })
      : []

  memberships.forEach((membership, index, memberships) => {
    memberships[index].user = membershipsUsers.find(
      (u) => u.id === membership.userId,
    )
  })

  return {
    to: user.email,
    subject: t('api/email/membership_giver_prolong_notice/subject'),
    templateName: 'membership_giver_prolong_notice',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: user.name,
      },
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&membershipIds=${membershipIds.join(
          '~',
        )}&token=${customPledgeToken}`,
      },
      {
        name: 'gifted_memberships_count',
        content: memberships.length,
      },
      {
        name: 'hasMultipleGiftedMemberships',
        content: memberships.length > 1,
      },
      {
        name: 'hasOneGiftedMembership',
        content: memberships.length === 1,
      },
      {
        name: 'inform_claimers_days',
        content: informClaimersDays,
      },
      {
        name: 'options',
        content: memberships.map((membership) => {
          const olabel = t('api/email/option/other/gifted_membership', {
            name: transformUser(membership.user).name,
            sequenceNumber: membership.sequenceNumber,
          })
          return { olabel }
        }),
      },
    ],
  }
}

mail.prepareMembershipWinback = async (
  { userId, cancellationCategory, cancelledAt },
  { t, pgdb },
) => {
  const user = transformUser(await pgdb.public.users.findOne({ id: userId }))
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  return {
    to: user.email,
    subject: t.first([
      `api/email/membership_winback_${cancellationCategory}/subject`,
      'api/email/membership_winback/subject',
    ]),
    templateName: `membership_winback_${cancellationCategory}`,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: user.name,
      },
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`,
      },
      {
        name: 'prolong_url_reduced',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}&userPrice=1`,
      },
      {
        name: 'cancelled_at',
        content: dateFormat(cancelledAt),
      },
    ],
  }
}

mail.prepareMembershipOwnerNotice = async (
  { user, endDate, graceEndDate, cancelUntilDate, templateName, fromName },
  { pgdb, t },
) => {
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')

  const formattedEndDate = dateFormat(endDate)
  const formattedGraceEndDate = dateFormat(graceEndDate)

  const timeLeft = moment(endDate).startOf('day').diff(moment().startOf('day'))
  const daysLeft = Math.max(1, Math.ceil(moment.duration(timeLeft).as('days')))

  const membershipId = user.membershipId || false
  const sequenceNumber = user.membershipSequenceNumber || false

  const autoPay = user.autoPay

  return {
    to: user.email,
    subject: t.first(
      [
        `api/email/${templateName}/sequenceNumber/${!!sequenceNumber}/subject`,
        `api/email/${templateName}/subject`,
      ],
      {
        endDate: formattedEndDate,
        sequenceNumber,
      },
    ),
    fromName,
    templateName,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      {
        name: 'name',
        content: user.name,
      },
      {
        name: 'prolong_url',
        content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`,
      },
      {
        name: 'cockpit_url',
        content: `${FRONTEND_BASE_URL}/angebote?goto=cockpit&token=${customPledgeToken}`,
      },
      {
        name: 'cancel_url',
        content: membershipId
          ? `${FRONTEND_BASE_URL}/abgang?membershipId=${membershipId}`
          : `${FRONTEND_BASE_URL}/konto#abos`,
      },
      {
        name: 'end_date',
        content: formattedEndDate,
      },
      {
        name: 'grace_end_date',
        content: formattedGraceEndDate,
      },
      {
        name: 'days_left',
        content: daysLeft,
      },
      {
        name: 'cancel_until_date',
        content: dateFormat(cancelUntilDate),
      },
      {
        name: 'sequence_number',
        content: sequenceNumber,
      },
      autoPay &&
        autoPay.membershipType && {
          name: 'autopay_membership_type',
          content: autoPay.membershipType,
        },
      autoPay &&
        autoPay.membershipType && {
          name: 'autopay_membership_type_benefactor',
          content: autoPay.membershipType === 'BENEFACTOR',
        },
      autoPay &&
        autoPay.withDiscount && {
          name: 'autopay_with_discount',
          content: autoPay.withDiscount,
        },
      autoPay &&
        autoPay.withDonation && {
          name: 'autopay_with_donation',
          content: autoPay.withDonation,
        },
      autoPay &&
        autoPay.defaultPrice && {
          name: 'autopay_default_price',
          content: formatPriceChf(autoPay.defaultPrice / 100),
        },
      autoPay &&
        autoPay.total && {
          name: 'autopay_total',
          content: formatPriceChf(autoPay.total / 100),
        },
      autoPay &&
        autoPay.card && {
          name: 'autopay_card_brand',
          content: t.first([
            `api/email/card/${autoPay.card.brand}`,
            `api/email/card`,
          ]),
        },
      autoPay &&
        autoPay.card && {
          name: 'autopay_card_last4',
          content: autoPay.card.last4,
        },
    ],
  }
}

mail.sendMembershipOwnerAutoPay = async ({ autoPay, payload, pgdb, t }) => {
  // Ditch sending email if it's not a card_error
  if (
    payload.chargeAttemptStatus !== 'SUCCESS' &&
    payload.chargeAttemptError &&
    (!payload.chargeAttemptError.raw ||
      payload.chargeAttemptError.raw.type !== 'card_error')
  ) {
    return
  }

  const user = await pgdb.public.users.findOne({ id: autoPay.userId })
  const customPledgeToken = AccessToken.generateForUser(user, 'CUSTOM_PLEDGE')
  const version =
    payload.chargeAttemptStatus === 'SUCCESS' ? 'successful' : 'failed'
  const templateName = `membership_owner_autopay_${version}`
  const subject = t.first([
    `api/email/${templateName}_${payload.attemptNumber}/subject`,
    `api/email/${templateName}/subject`,
  ])

  return sendMailTemplate(
    {
      to: user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject,
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        {
          name: 'prolong_url',
          content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}`,
        },
        {
          name: 'prolong_url_reduced',
          content: `${FRONTEND_BASE_URL}/angebote?package=PROLONG&token=${customPledgeToken}&userPrice=1`,
        },
        {
          name: 'end_date',
          content: dateFormat(autoPay.endDate),
        },
        {
          name: 'grace_end_date',
          content: dateFormat(autoPay.graceEndDate),
        },
        {
          name: 'prolonged_end_date',
          content: dateFormat(autoPay.prolongedEndDate),
        },
        {
          name: 'autopay_total',
          content: formatPriceChf(autoPay.total / 100),
        },
        autoPay.card && {
          name: 'autopay_card_brand',
          content: t.first([
            `api/email/card/${autoPay.card.brand}`,
            `api/email/card`,
          ]),
        },
        autoPay.card && {
          name: 'autopay_card_last4',
          content: autoPay.card.last4,
        },
        {
          name: 'attempt_number',
          content: payload.attemptNumber,
        },
        {
          name: 'thirdAttempt',
          content: payload.attemptNumber === 3,
        },
        {
          name: 'fourthAttempt',
          content: payload.attemptNumber === 4,
        },
        {
          name: 'authentication_required',
          content: payload.authenticationRequired,
        },
        {
          name: 'attempt_is_last',
          content: payload.isLastAttempt,
        },
        {
          name: 'attempt_next_is_last',
          content: payload.isNextAttemptLast,
        },
        !payload.isLastAttempt &&
          payload.nextAttemptDate && {
            name: 'attempt_next_at',
            content: dateFormat(payload.nextAttemptDate),
          },
      ],
    },
    { pgdb },
  )
}

mail.sendMembershipClaimNotice = async ({ membership }, { pgdb, t }) => {
  const membershipType = await pgdb.public.membershipTypes.findOne({
    id: membership.membershipTypeId,
  })
  const pledge = await pgdb.public.pledges.findOne({ id: membership.pledgeId })
  const pledger = await pgdb.public.users.findOne({ id: pledge.userId })
  const claimer = await pgdb.public.users
    .findOne({ id: membership.userId })
    .then(transformUser)

  return sendMailTemplate(
    {
      to: pledger.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/email/membership_giver_claim_notice/subject', {
        recipientName: claimer.name,
      }),
      templateName: 'membership_giver_claim_notice',
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        {
          name: 'recipient_name',
          content: claimer.name,
        },
        {
          name: 'membership_type',
          content: membershipType.name,
        },
        {
          name: 'membership_type_interval',
          content: membershipType.interval,
        },
        {
          name: 'hasMonthlyAbo',
          content: membershipType.interval === 'month',
        },
      ],
    },
    { pgdb },
  )
}

mail.sendMembershipClaimerOnboarding = async (
  { claimedMembership, activeMembership },
  { pgdb, t },
) => {
  const claimer = await pgdb.public.users.findOne({
    id: claimedMembership.userId,
  })
  const claimedMembershipCompany = await getMembershipCompany(
    claimedMembership,
    pgdb,
  )
  const activeMembershipCompany =
    activeMembership && (await getMembershipCompany(activeMembership, pgdb))

  return sendMailTemplate(
    {
      to: claimer.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      templateName: 'membership_claimer_onboarding',
      mergeLanguage: 'handlebars',
      subject: t.first(
        [
          activeMembership &&
            `api/email/membership_claimer_onboarding/has_active_membership/subject`,
          `api/email/membership_claimer_onboarding/${claimedMembershipCompany}/subject`,
          `api/email/membership_claimer_onboarding/subject`,
        ].filter(Boolean),
      ),
      globalMergeVars: [
        {
          name: 'active_membership_type_company_name',
          content: activeMembershipCompany,
        },
        {
          name: 'isRepublikMember',
          content: activeMembershipCompany === 'REPUBLIK',
        },
      ],
    },
    { pgdb },
  )
}

/**
 * Attempts to fetch a pledge and related data, and generates a series of merge
 * variables.
 */
mail.getPledgeMergeVars = async (
  { pledge, user = false, package_ = false },
  { pgdb, t },
) => {
  if (!user) {
    user = await pgdb.public.users.findOne({ id: pledge.userId })
  }

  if (!package_) {
    package_ = await pgdb.public.packages.findOne({ id: pledge.packageId })
  }

  const pledgePayment = await pgdb.public.pledgePayments.findFirst(
    { pledgeId: pledge.id },
    { orderBy: ['createdAt desc'] },
  )
  const payment =
    pledgePayment &&
    (await invoices.commons.resolvePayment(
      { id: pledgePayment.paymentId },
      { pgdb, t },
    ))

  const pledgeOptions = await pgdb.public.pledgeOptions.find(
    {
      pledgeId: pledge.id,
      'amount >': 0,
    },
    {
      orderBy: ['amount desc'],
    },
  )

  const packageOptions = await pgdb.public.packageOptions.find({
    id: pledgeOptions.map((o) => o.templateId),
  })

  const rewardGoodies = await pgdb.public.goodies.find({
    rewardId: packageOptions.map((o) => o.rewardId),
  })

  const rewardMembershipTypes = await pgdb.public.membershipTypes.find({
    rewardId: packageOptions.map((o) => o.rewardId),
  })

  const rewards = rewardGoodies.concat(rewardMembershipTypes)

  packageOptions.forEach((packageOption, index, packageOptions) => {
    packageOptions[index].reward = rewards.find(
      (r) => r.rewardId === packageOption.rewardId,
    )
  })

  // Find membership IDs mentoned in pledgeOption.membershipId
  const pledgedMemberships = pledgeOptions
    .map((pledgeOption) => pledgeOption.membershipId)
    .filter(Boolean)

  // All affected memberships. These are memberships that spring from this
  // pledge, or memberships that were mentioned pledgeOption.membershipId.
  const memberships = await pgdb.public.memberships.find({
    or: [
      { pledgeId: pledge.id },
      pledgedMemberships.length > 0 && { id: pledgedMemberships },
    ].filter(Boolean),
  })

  const membershipsUsers =
    memberships.length > 0
      ? await pgdb.public.users.find({ id: memberships.map((m) => m.userId) })
      : []

  memberships.forEach((membership, index, memberships) => {
    memberships[index].user = membershipsUsers.find(
      (u) => u.id === membership.userId,
    )
  })

  pledgeOptions.forEach((pledgeOption, index, pledgeOptions) => {
    pledgeOptions[index].packageOption = packageOptions.find(
      (o) => o.id === pledgeOption.templateId,
    )

    if (pledgeOption.membershipId) {
      pledgeOptions[index].membership = memberships.find(
        (m) => m.id === pledgeOption.membershipId,
      )
    }
  })

  pledgeOptions
    // Sort by price
    .sort((a, b) => descending(a.price, b.price))
    // Sort by sequenceNumber in an ascending manner
    .sort((a, b) =>
      ascending(
        a.membership && a.membership.sequenceNumber,
        b.membership && b.membership.sequenceNumber,
      ),
    )
    // Sort by userID, own ones up top.
    .sort((a, b) =>
      descending(
        a.membership && a.membership.userId === user.id,
        b.membership && b.membership.userId === user.id,
      ),
    )
    // Sort by packageOption.order in an ascending manner
    .sort((a, b) =>
      ascending(
        a.packageOption && a.packageOption.order,
        b.packageOption && b.packageOption.order,
      ),
    )

  const pledgerMemberships = memberships.filter(
    (membership) => pledge.userId === membership.userId,
  )

  const giftedMemberships = memberships.filter(
    (membership) => pledge.userId !== membership.userId,
  )

  const address = await pgdb.public.addresses.findOne({ id: user.addressId })

  const discount = pledge.donation < 0 ? (0 - pledge.donation) / 100 : 0
  const donation = pledge.donation > 0 ? pledge.donation / 100 : 0
  const total = pledge.total / 100

  const hasGoodies = rewardGoodies.map((goodie) => {
    return {
      // MUG_CERAMIC is a special mug we use as a goodie until we have the final mug.
      // In transactionals this prop can fallback to 'mug' in both cases.
      name: `goodies_has_${
        goodie.name === 'MUG_CERAMIC' ? 'mug' : goodie.name.toLowerCase()
      }`,
      content: !!pledgeOptions.filter(
        (pledgeOption) =>
          pledgeOption.packageOption.reward &&
          pledgeOption.packageOption.reward.name === goodie.name &&
          pledgeOption.amount > 0,
      ).length,
    }
  })

  const voucherCodes = ['ABO_GIVE', 'ABO_GIVE_MONTHS'].includes(package_.name)
    ? memberships.map((m) => m.voucherCode).filter(Boolean)
    : null
  const formattedVoucherCodes =
    voucherCodes && voucherCodes.length ? voucherCodes.join(', ') : null

  const numAccessGrantedMemberships = memberships.filter(
    (m) => !!m.accessGranted,
  ).length

  const creditor = payment?.pledge?.package?.bankAccount

  const monthlyActiveMemberships = await pgdb.queryOneColumn(`
    SELECT m.id 
    FROM memberships m
    JOIN "membershipTypes" t
      ON m."membershipTypeId" = t.id
    WHERE m."userId" = '${user.id}'
      AND t.name = 'MONTHLY_ABO'
      AND m.active = TRUE
  `)

  const hasActiveMonthly = monthlyActiveMemberships.length > 0

  const goodiesCount = pledgeOptions
    // Filter "pseudo" pledge options without a reward
    .filter(
      (pledgeOption) =>
        pledgeOption.packageOption.reward &&
        pledgeOption.packageOption.reward.rewardType === 'Goodie',
    )
    .reduce((agg, pledgeOption) => agg + pledgeOption.amount, 0)

  return [
    // Purchase itself
    {
      name: 'options',
      content: pledgeOptions
        // Filter "pseudo" pledge options without a reward
        .filter((pledgeOption) => pledgeOption.packageOption.reward)
        .map((pledgeOption) => {
          const { rewardType, name } = pledgeOption.packageOption.reward

          const isGiftedMembership =
            pledgeOption.membership &&
            pledgeOption.membership.userId !== pledge.userId

          const labelFragmentInterval = t.pluralize(
            `api/email/option/interval/${pledgeOption.packageOption.reward.interval}/periods`,
            { count: pledgeOption.periods },
          )

          const labelDefault = t.pluralize(
            `api/email/option/${rewardType.toLowerCase()}/${name.toLowerCase()}`,
            { count: pledgeOption.amount, interval: labelFragmentInterval },
          )

          const labelGiftedMembership = t(
            'api/email/option/other/gifted_membership',
            {
              name:
                pledgeOption.membership &&
                transformUser(pledgeOption.membership.user).name,
              sequenceNumber:
                pledgeOption.membership &&
                pledgeOption.membership.sequenceNumber,
            },
          )

          const oprice =
            (pledgeOption.price * (pledgeOption.periods || 1)) / 100
          const ototal = oprice * pledgeOption.amount

          return {
            oamount: pledgeOption.amount,
            hasMultipleOAmounts: pledgeOption.amount > 1,
            otype: rewardType,
            isOTypeGoodie: rewardType === 'Goodie',
            oname: name,
            olabel: !isGiftedMembership ? labelDefault : labelGiftedMembership,
            oprice,
            oprice_formatted: formatPriceChf(oprice),
            ototal,
            ototal_formatted: formatPriceChf(ototal),
          }
        }),
    },
    {
      name: 'discount',
      content: discount,
    },
    {
      name: 'discount_formatted',
      content: formatPriceChf(discount),
    },
    {
      name: 'donation',
      content: donation,
    },
    {
      name: 'donation_formatted',
      content: formatPriceChf(donation),
    },
    {
      name: 'total',
      content: total,
    },
    {
      name: 'totalPledgeAbove1000',
      content: total > 1000,
    },
    {
      name: 'totalPledgeBelow1000',
      content: total < 1000,
    },
    {
      name: 'total_formatted',
      content: formatPriceChf(total),
    },

    // Payment
    ...(payment?.id
      ? [
          {
            name: 'payment_method',
            content: payment.method,
          },
          {
            name: 'hrid',
            content: payment.hrid,
          },
          {
            name: 'due_date',
            content: dateFormat(payment.dueDate),
          },
          {
            name: 'paymentslip',
            content: payment.method === 'PAYMENTSLIP',
          },
          {
            name: 'not_paymentslip',
            content: payment.method !== 'PAYMENTSLIP',
          },
          {
            name: 'iban',
            content: creditor.iban.match(/.{1,4}/g).join(' '),
          },
          {
            name: 'reference',
            content: invoices.commons.getReference(payment.hrid, true),
          },
          invoices.paymentslip.isApplicable(payment) && {
            type: 'application/pdf',
            name:
              [
                'QR-Rechnung',
                creditor?.address?.name,
                invoices.commons.getReference(payment.hrid, true),
              ]
                .filter(Boolean)
                .join(' ') + '.pdf',
            content: (await invoices.paymentslip.generate(payment)).toString(
              'base64',
            ),
          },
        ]
      : []),

    {
      name: 'waiting_for_payment',
      content: pledge.status === 'WAITING_FOR_PAYMENT',
    },

    // Helpers
    {
      name: 'name',
      content: [user.firstName, user.lastName].filter(Boolean).join(' ').trim(),
    },
    {
      name: 'voucher_codes',
      content: formattedVoucherCodes,
    },
    {
      name: 'num_access_granted_memberships',
      content: numAccessGrantedMemberships,
    },
    {
      name: 'hasAnyGrantedMemberships',
      content: numAccessGrantedMemberships > 0,
    },
    {
      name: 'hasOneGrantedMemberships',
      content: numAccessGrantedMemberships === 1,
    },
    {
      name: 'hasMultipleGrantedMemberships',
      content: numAccessGrantedMemberships > 1,
    },
    {
      name: 'goodies_count',
      content: goodiesCount,
    },
    {
      name: 'hasOneGoodie',
      content: goodiesCount === 1,
    },
    {
      name: 'hasMultipleGoodies',
      content: goodiesCount > 1,
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
        : null,
    },
    {
      name: 'pledger_memberships_count',
      content: pledgerMemberships.length,
    },
    {
      name: 'hasAnyPledgeMemberships',
      content: pledgerMemberships.length > 0,
    },
    {
      name: 'gifted_memberships_count',
      content: giftedMemberships.length,
    },
    {
      name: 'hasMultipleGiftedMemberships',
      content: giftedMemberships.length > 1,
    },
    {
      name: 'hasOneGiftedMembership',
      content: giftedMemberships.length === 1,
    },
    {
      name: 'link_claim',
      content: `${FRONTEND_BASE_URL}/abholen`,
    },
    {
      name: 'pledger_memberships_active_monthly',
      content: hasActiveMonthly,
    },
  ]
}

mail.sendReferralCampaignMail = async (
  {
    referrerUserId,
    pledgeUserId,
    referralCount,
    hasMonthlyAbo,
    noActiveMembership,
  },
  { pgdb, t },
) => {
  const referrer = await pgdb.public.users.findOne({ id: referrerUserId })
  const safeReferrer = transformUser(referrer)

  const pledger = await pgdb.public.users.findOne({ id: pledgeUserId })
  const safePledger = transformUser(pledger)

  const countNumber = parseInt(referralCount, 10)

  // TODO should not be hardcoded
  let campaignTemplate
  if (countNumber === 1) {
    campaignTemplate = 'first'
  } else if (countNumber === 2) {
    campaignTemplate = 'second'
  } else {
    campaignTemplate = 'all'
  }
  const templateName = `referral_campaign_referral_${campaignTemplate}`

  return sendMailTemplate(
    {
      to: safeReferrer.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        {
          name: 'referral_count',
          content: countNumber,
        },
        {
          name: 'receiver',
          content: safePledger.name ? safePledger.name : safePledger.email,
        },
        {
          name: 'link_sender_page',
          content: `${FRONTEND_BASE_URL}/einladen`,
        },
        {
          name: 'has_monthly_abo',
          content: hasMonthlyAbo,
        },
        {
          name: 'no_active_membership',
          content: noActiveMembership,
        },
      ],
    },
    { pgdb },
  )
}

module.exports = mail
