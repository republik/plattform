const { transformUser } = require('@orbiting/backend-modules-auth')

module.exports = {
  async user (payment, args, { pgdb }) {
    const users = await pgdb.query(`
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
    `, {
      paymentId: payment.id
    })
    if (!users.length) {
      return null
    }
    return transformUser(users[0])
  }
}
