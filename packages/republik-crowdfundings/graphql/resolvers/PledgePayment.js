const {
  Roles,
  AccessToken,
  transformUser,
} = require('@orbiting/backend-modules-auth')
const invoices = require('@orbiting/backend-modules-invoices')

const { PUBLIC_URL } = process.env

module.exports = {
  reference(payment, args) {
    return invoices.commons.getReference(payment.hrid, args.pretty)
  },
  async user(payment, args, { pgdb }) {
    const users = await pgdb.query(
      `
      SELECT
        *
      FROM
        users
      WHERE
        id = (
          SELECT
            p."userId"
          FROM
            payments pay
          JOIN
            "pledgePayments" pp
            ON pay.id=pp."paymentId"
          JOIN
            pledges p
            ON pp."pledgeId"=p.id
          WHERE
            pay.id = :paymentId
          GROUP BY
            p."userId"
        )
    `,
      {
        paymentId: payment.id,
      },
    )
    if (!users.length) {
      return null
    }
    return transformUser(users[0])
  },
  async invoiceUrl(payment, args, context) {
    const { user: me } = context

    if (!Roles.userIsInRoles(me, ['admin', 'supporter'])) {
      return null
    }

    const resolvedPayment = await invoices.commons.resolvePayment(
      { id: payment.id },
      context,
    )

    if (!invoices.invoice.isApplicable(resolvedPayment)) {
      return null
    }

    const user = resolvedPayment?.pledge?.user

    const token = AccessToken.generateForUser(user, 'INVOICE')
    return `${PUBLIC_URL}/invoices/${payment.hrid}.pdf?token=${token}`
  },
  async paymentslipUrl(payment, args, context) {
    const { user: me } = context
    const resolvedPayment = await invoices.commons.resolvePayment(
      { id: payment.id },
      context,
    )

    if (!invoices.paymentslip.isApplicable(resolvedPayment)) {
      return null
    }

    const user = resolvedPayment?.pledge?.user

    if (!user || !Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return null
    }

    const token = AccessToken.generateForUser(user, 'INVOICE')
    return `${PUBLIC_URL}/invoices/paymentslip/${payment.hrid}.pdf?token=${token}`
  },
}
