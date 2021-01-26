import { Express } from 'express'
import * as invoices from '../'

const { AccessToken } = require('@orbiting/backend-modules-auth')

const middleware = async (
  server: Express,
  _pgdb: any,
  _t: any,
  _redis: any,
  context: any,
) => {
  server.get('/invoices/:hrid.pdf', async (req, res) => {
    // @TODO: AccessToken-Check

    const { hrid } = req.params
    const payment = await invoices.commons.resolvePayment({ hrid }, context)

    res.json(payment)
  })

  server.get('/invoices/paymentslip/:hrid.pdf', async (req, res, next) => {
    const { token } = req.query

    if (!token) {
      return next()
    }

    const user = await AccessToken.getUserByAccessToken(token, context)

    if (!AccessToken.isReqPathAllowed(user, req)) {
      return next()
    }

    const { hrid } = req.params
    const payment = await invoices.commons.resolvePayment({ hrid }, context)

    if (!invoices.paymentslip.isApplicable(payment)) {
      return next()
    }

    if (payment?.pledge?.userId !== user.id) {
      return next()
    }

    const pdf = await invoices.paymentslip.generate(payment)

    res
      .writeHead(200, {
        'Content-Length': Buffer.byteLength(pdf),
        'Content-Type': 'application/pdf',
      })
      .end(pdf)
  })
}

export default module.exports = middleware
