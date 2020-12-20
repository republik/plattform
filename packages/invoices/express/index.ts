import { Express } from 'express'
import * as paymentslip from '../lib/paymentslip'

const { AccessToken } = require('@orbiting/backend-modules-auth')

const middleware = async (
  server: Express,
  _pgdb: any,
  _t: any,
  _redis: any,
  context: any,
) => {
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
    const payment = await paymentslip.resolve({ hrid }, context)

    if (!paymentslip.isApplicable(payment)) {
      return next()
    }

    if (payment?.pledge?.userId !== user.id) {
      return next()
    }

    const pdf = await paymentslip.generate(payment)

    res
      .writeHead(200, {
        'Content-Length': Buffer.byteLength(pdf),
        'Content-Type': 'application/pdf',
      })
      .end(pdf)
  })
}

export default module.exports = middleware
