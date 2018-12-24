const { sendMailTemplate } = require('@orbiting/backend-modules-mail')

module.exports = async (pledgeId, pgdb, t) => {
  const pledge = await pgdb.public.pledges.findOne({id: pledgeId})
  const user = await pgdb.public.users.findOne({id: pledge.userId})
  const pkg = await pgdb.public.packages.findOne({id: pledge.packageId})
  const memberships = await pgdb.public.memberships.find({pledgeId: pledge.id})

  const voucherCodes = memberships.map(m => m.voucherCode).filter(Boolean)

  // get packageOptions which include the NOTEBOOK
  const goodie = await pgdb.public.goodies.findOne({name: 'NOTEBOOK'})
  let notebook = null
  if (goodie) {
    const reward = await pgdb.public.rewards.findOne({id: goodie.rewardId})
    const pkgOptions = await pgdb.public.packageOptions.find({rewardId: reward.id})
    notebook = await pgdb.public.pledgeOptions.count({
      pledgeId: pledge.id,
      templateId: pkgOptions.map(p => p.id),
      'amount >': 0
    })
  }

  await sendMailTemplate({
    to: user.email,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/payment/received/mail/subject'),
    templateName: 'cf_successful_payment',
    mergeLanguage: 'handlebars',
    globalMergeVars: [
      { name: 'name',
        content: [user.firstName, user.lastName]
          .filter(Boolean)
          .join(' ')
      },
      { name: 'ask_personal_info',
        content: (!user.addressId || !user.birthday)
      },
      { name: 'notebook',
        content: !!notebook
      },
      { name: 'voucher_codes',
        content: ['ABO_GIVE', 'ABO_GIVE_MONTHS'].includes(pkg.name) && voucherCodes.length
          ? voucherCodes.join(', ')
          : null
      },
      { name: 'package_name',
        content: pkg.name
      }
    ]
  }, { pgdb })
}
