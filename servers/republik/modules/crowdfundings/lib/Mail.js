const debug = require('debug')('crowdfundings:lib:Mail')

const { createMail } = require('@orbiting/backend-modules-mail')
const { grants } = require('@orbiting/backend-modules-access')
const { transformUser } = require('@orbiting/backend-modules-auth')
const { timeFormat, formatPriceChf } =
  require('@orbiting/backend-modules-formats')

const {
  checkMembershipSubscriptions: getCheckMembershipSubscriptions
} = require('../graphql/resolvers/User')
const { getLastEndDate } = require('./utils')

const dateFormat = timeFormat('%x')

const {
  MAILCHIMP_INTEREST_PLEDGE,
  MAILCHIMP_INTEREST_MEMBER,
  MAILCHIMP_INTEREST_MEMBER_BENEFACTOR,
  MAILCHIMP_INTEREST_GRANTED_ACCESS,
  MAILCHIMP_INTEREST_NEWSLETTER_DAILY,
  MAILCHIMP_INTEREST_NEWSLETTER_WEEKLY,
  MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON,
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
    name: 'FEUILLETON',
    interestId: MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON,
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
    interests[MAILCHIMP_INTEREST_NEWSLETTER_FEUILLETON] = true
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
  const user = !!userId && await pgdb.public.users.findOne({id: userId})

  const interests = await getInterestsForUser({
    userId: !!user && user.id,
    subscribeToEditorialNewsletters,
    pgdb
  })

  const sanitizedUser = user || { email, roles: [] }
  return mail.updateNewsletterSubscriptions({ user: sanitizedUser, interests, ...rest })
}

mail.sendMembershipProlongNotice = async ({
  pledger,
  membership,
  additionalPeriods,
  t
}) => {
  const safePledger = transformUser(pledger)
  const safeMembershipUser = transformUser(membership.user)

  await mail.sendMailTemplate({
    to: membership.user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t(
      `api/email/membership_prolong_notice/subject`
    ),
    templateName: `membership_prolong_notice`,
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: safeMembershipUser.name },
      { name: 'pledger_name',
        content: safePledger.name },
      { name: 'end_date',
        content: dateFormat(getLastEndDate(additionalPeriods)) }
    ]
  })
}

mail.sendPledgeConfirmations = async ({ userId, pgdb, t }) => {
  const user = await pgdb.public.users.findOne({ id: userId })
  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    sendConfirmMail: true
  })

  if (!pledges.length) { return }

  const checkMembershipSubscriptions = await getCheckMembershipSubscriptions(user, null, { pgdb, user })

  const address = await pgdb.public.addresses.findOne({id: user.addressId})

  // get packageOptions which include the NOTEBOOK
  const goodieNotebook = await pgdb.public.goodies.findOne({name: 'NOTEBOOK'})
  const rewardNotebook = await pgdb.public.rewards.findOne({id: goodieNotebook.rewardId})
  const pkgOptionsNotebook = await pgdb.public.packageOptions.find({rewardId: rewardNotebook.id})
  const goodieTotebag = await pgdb.public.goodies.findOne({name: 'TOTEBAG'})
  const rewardTotebag = await pgdb.public.rewards.findOne({id: goodieTotebag.rewardId})
  const pkgOptionsTotebag = await pgdb.public.packageOptions.find({rewardId: rewardTotebag.id})

  await Promise.all(pledges.map(async (pledge) => {
    const pkg = await pgdb.public.packages.findOne({id: pledge.packageId})
    const pledgePayment = await pgdb.public.pledgePayments.findFirst({pledgeId: pledge.id}, {orderBy: ['createdAt desc']})
    const payment = pledgePayment
      ? await pgdb.public.payments.findOne({id: pledgePayment.paymentId})
      : {}

    const notebook = await pgdb.public.pledgeOptions.count({
      pledgeId: pledge.id,
      templateId: pkgOptionsNotebook.map(p => p.id),
      'amount >': 0
    })
    const totebag = await pgdb.public.pledgeOptions.count({
      pledgeId: pledge.id,
      templateId: pkgOptionsTotebag.map(p => p.id),
      'amount >': 0
    })

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
      // Sort by sequenceNumber in an ascending manner
      .sort(
        (a, b) =>
          a.membership &&
          b.membership &&
          a.membership.sequenceNumber < b.membership.sequenceNumber ? 1 : 0
      )
      // Sort by userID, own ones up top.
      .sort(
        (a, b) => a.membership && a.membership.userId !== pledge.userId ? 1 : 0
      )

    /*
      pledgeOptions[] {
        packageOption {
          reward {
            rewardType (Goodie|MembershipType)
            name
          }
        }
        membership {
          user
        }
      }
    */

    const giftedMemberships = memberships
      .filter(membership => pledge.userId !== membership.userId)

    const templateName = `pledge_${pkg.name.toLowerCase()}`

    const discount = pledge.donation < 0 ? (0 - pledge.donation) / 100 : 0
    const donation = pledge.donation > 0 ? pledge.donation / 100 : 0
    const total = pledge.total / 100

    return mail.sendMailTemplate({
      to: user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t(`api/email/${templateName}/subject`),
      templateName,
      mergeLanguage: 'handlebars',
      globalMergeVars: [
        // Purchase itself
        { name: 'options',
          content: pledgeOptions
            // Filter "pseudo" pledge options without a reward
            .filter(pledgeOption => pledgeOption.packageOption.reward)
            .map(pledgeOption => {
              const { rewardType, name } = pledgeOption.packageOption.reward

              const isGiftedMembership =
                pledgeOption.membership &&
                pledgeOption.membership.userId !== pledge.userId

              const olabel = isGiftedMembership
                ? t('api/email/option/other/gifted_membership', {
                  name: transformUser(pledgeOption.membership.user).name,
                  sequenceNumber: pledgeOption.membership.sequenceNumber
                })
                : t([
                  'api/email/option',
                  rewardType.toLowerCase(),
                  name.toLowerCase()
                ].join('/'))

              const oprice =
                pledgeOption.price / 100
              const ototal =
                (pledgeOption.amount * pledgeOption.price) / 100

              return {
                oamount: pledgeOption.amount,
                olabel,
                oprice,
                oprice_formatted: formatPriceChf(oprice),
                ototal,
                ototal_formatted: formatPriceChf(ototal)
              }
            })
        },
        { name: 'discount',
          content: discount
        },
        { name: 'discount_formatted',
          content: formatPriceChf(discount)
        },
        { name: 'donation',
          content: donation
        },
        { name: 'donation_formatted',
          content: formatPriceChf(donation)
        },
        { name: 'total',
          content: total
        },
        { name: 'total_formatted',
          content: formatPriceChf(total)
        },

        // Payment
        { name: 'payment_method',
          content: payment.method },
        ...payment
          ? [
            { name: 'HRID',
              content: payment.hrid
            },
            { name: 'due_date',
              content: dateFormat(payment.dueDate)
            },
            { name: 'paymentslip',
              content: payment.method === 'PAYMENTSLIP'
            },
            { name: 'not_paymentslip',
              content: payment.method !== 'PAYMENTSLIP'
            }
          ]
          : [],
        { name: 'waiting_for_payment',
          content: pledge.status === 'WAITING_FOR_PAYMENT'
        },

        // Helpers
        { name: 'name',
          content: [user.firstName, user.lastName]
            .filter(Boolean)
            .join(' ')
            .trim()
        },
        { name: 'abo_for_me',
          content:
            pkg.name !== 'DONATE' &&
            pkg.name !== 'ABO_GIVE' &&
            pkg.name !== 'PROLONG'
        },
        { name: 'voucher_codes',
          content: pkg.name === 'ABO_GIVE'
            ? memberships.map(m => m.voucherCode).join(', ')
            : null
        },
        { name: 'notebook_or_totebag',
          content: !!notebook || !!totebag
        },
        { name: 'address',
          content: address
            ? `<span>${address.name}<br/>
${address.line1}<br/>
${address.line2 ? address.line2 + '<br/>' : ''}
${address.postalCode} ${address.city}<br/>
${address.country}</span>`
            : null
        },
        { name: 'check_membership_subscriptions',
          content: checkMembershipSubscriptions
        },
        { name: 'frontend_base_url',
          content: FRONTEND_BASE_URL },
        { name: 'gifted_memberships_count',
          content: giftedMemberships.length
        }
      ]
    })
  }))

  await pgdb.public.pledges.update({id: pledges.map(pledge => pledge.id)}, {
    sendConfirmMail: false
  })
}

mail.sendMembershipCancellation = async ({ email, name, endDate, t }) => {
  return mail.sendMailTemplate({
    to: email,
    subject: t('api/email/membership_cancel_notice/subject'),
    templateName: 'membership_cancel_notice',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: name
      },
      { name: 'end_date',
        content: dateFormat(endDate)
      }
    ]
  })
}

module.exports = mail
