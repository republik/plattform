import { Express, Request, Response, NextFunction } from 'express'
import * as invoices from '../'

const { AccessToken } = require('@orbiting/backend-modules-auth')

import { Context } from '@orbiting/backend-modules-types'

const middleware = async (
  server: Express,
  _pgdb: any,
  _t: any,
  _redis: any,
  context: any,
) => {
  function getPdfReqHandler(
    isApplicableFn: (payment: invoices.commons.PaymentResolved) => boolean,
    generateFn: (
      payment: invoices.commons.PaymentResolved,
      context: Context,
    ) => Promise<Buffer>,
  ) {
    return async function reqHandler(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
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

        if (!isApplicableFn(payment)) {
          return next()
        }

        if (payment?.pledge?.userId !== user.id) {
          return next()
        }

        const pdf = await generateFn(payment, context)
        res
          .writeHead(200, {
            'Content-Length': Buffer.byteLength(pdf),
            'Content-Type': 'application/pdf',
          })
          .end(pdf)
      } catch (error) {
        console.error('error while generating invoice or payment slip', {
          error,
        })
        res.status(500).end()
      }
    }
  }

  server.get(
    '/invoices/:hrid.pdf',
    getPdfReqHandler(invoices.invoice.isApplicable, invoices.invoice.generate),
  )

  server.get(
    '/invoices/paymentslip/:hrid.pdf',
    getPdfReqHandler(
      invoices.paymentslip.isApplicable,
      invoices.paymentslip.generate,
    ),
  )
}

export default module.exports = middleware
