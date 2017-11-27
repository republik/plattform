const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

module.exports = async (pledgeId, pgdb, t) => {
  const pledge = await pgdb.public.pledges.findOne({id: pledgeId})
  const user = await pgdb.public.users.findOne({id: pledge.userId})
  const pkg = await pgdb.public.packages.findOne({id: pledge.packageId})
  const memberships = await pgdb.public.memberships.find({pledgeId: pledge.id})

  const voucherCodes = memberships.map(m => m.voucherCode).filter(Boolean)

  // get packageOptions which include the NOTEBOOK
  const goodie = await pgdb.public.goodies.findOne({name: 'NOTEBOOK'})
  const reward = await pgdb.public.rewards.findOne({id: goodie.rewardId})
  const pkgOptions = await pgdb.public.packageOptions.find({rewardId: reward.id})
  const notebook = await pgdb.public.pledgeOptions.count({
    pledgeId: pledge.id,
    templateId: pkgOptions.map(p => p.id),
    'amount >': 0
  })

  await sendMailTemplate({
    to: user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/payment/received/mail/subject'),
    templateName: 'cf_successful_payment',
    globalMergeVars: [
      { name: 'NAME',
        content: user.firstName + ' ' + user.lastName
      },
      { name: 'ASK_PERSONAL_INFO',
        content: (!user.addressId || !user.birthday)
      },
      { name: 'NOTEBOOK',
        content: !!notebook
      },
      { name: 'VOUCHER_CODES',
        content: pkg.name === 'ABO_GIVE' && voucherCodes.length
          ? voucherCodes.join(' ')
          : null
      }
    ]
  })
}
