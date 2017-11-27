const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { timeFormat } = require('@orbiting/backend-modules-formats')

const dateFormat = timeFormat('%x') // %x - the locale’s date

module.exports = async (userId, pgdb, t) => {
  const user = await pgdb.public.users.findOne({id: userId})

  const pledges = await pgdb.public.pledges.find({
    userId: user.id,
    sendConfirmMail: true
  })

  if (!pledges.length) { return }

  const address = await pgdb.public.addresses.findOne({id: user.addressId})

  const testimonial = await pgdb.public.testimonials.findFirst({
    userId: user.id
  })

  // get packageOptions which include the NOTEBOOK
  const goodieNotebook = await pgdb.public.goodies.findOne({name: 'NOTEBOOK'})
  const rewardNotebook = await pgdb.public.rewards.findOne({id: goodieNotebook.rewardId})
  const pkgOptionsNotebook = await pgdb.public.packageOptions.find({rewardId: rewardNotebook.id})
  const goodieToadbag = await pgdb.public.goodies.findOne({name: 'TOADBAG'})
  const rewardToadbag = await pgdb.public.rewards.findOne({id: goodieToadbag.rewardId})
  const pkgOptionsToadbag = await pgdb.public.packageOptions.find({rewardId: rewardToadbag.id})

  await Promise.all(pledges.map(async (pledge) => {
    const pkg = await pgdb.public.packages.findOne({id: pledge.packageId})
    const memberships = await pgdb.public.memberships.find({pledgeId: pledge.id})
    const pledgePayment = await pgdb.public.pledgePayments.findFirst({pledgeId: pledge.id}, {orderBy: ['createdAt desc']})
    const payment = await pgdb.public.payments.findOne({id: pledgePayment.paymentId})

    const notebook = await pgdb.public.pledgeOptions.count({
      pledgeId: pledge.id,
      templateId: pkgOptionsNotebook.map(p => p.id),
      'amount >': 0
    })
    const toadbag = await pgdb.public.pledgeOptions.count({
      pledgeId: pledge.id,
      templateId: pkgOptionsToadbag.map(p => p.id),
      'amount >': 0
    })

    return sendMailTemplate({
      to: user.email,
      fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
      subject: t('api/pledge/mail/subject'),
      templateName: 'cf_pledge',
      globalMergeVars: [
        { name: 'NAME',
          content: user.firstName + ' ' + user.lastName
        },
        { name: 'WAITING_FOR_PAYMENT',
          content: pledge.status === 'WAITING_FOR_PAYMENT'
        },
        { name: 'PAPER_INVOICE',
          content: payment.paperInvoice
        },
        { name: 'NOT_PAPER_INVOICE',
          content: !payment.paperInvoice
        },
        { name: 'HRID',
          content: payment.hrid
        },
        { name: 'DUE_DATE',
          content: dateFormat(payment.dueDate)
        },
        { name: 'PAYMENTSLIP',
          content: payment.method === 'PAYMENTSLIP'
        },
        { name: 'NOT_PAYMENTSLIP',
          content: !(payment.method === 'PAYMENTSLIP')
        },
        { name: 'ASK_PERSONAL_INFO',
          content: (!user.addressId || !user.birthday) && pkg.name !== 'DONATE' && pkg.name !== 'ABO_GIVE'
        },
        { name: 'ASK_TESTIMONIAL',
          content: !testimonial && pkg.name !== 'ABO_GIVE'
        },
        { name: 'VOUCHER_CODES',
          content: pkg.name === 'ABO_GIVE'
            ? memberships.map(m => m.voucherCode).join(', ')
            : null
        },
        { name: 'TOTAL',
          content: pledge.total / 100.0
        },
        { name: 'NOTEBOOK_OR_TOADBAG',
          content: !!notebook || !!toadbag
        },
        { name: 'ADDRESS',
          content: address
            ? `<span>${address.name}<br/>
${address.line1}<br/>
${address.line2 ? address.line2 + '<br/>' : ''}
${address.postalCode} ${address.city}<br/>
${address.country}</span>`
            : null
        }
      ]
    })
  }))

  await pgdb.public.pledges.update({id: pledges.map(pledge => pledge.id)}, {
    sendConfirmMail: false
  })
}
