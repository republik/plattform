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
    transformData: (req: Request, user: any) => any,
    generateFn: (data: any, context: Context) => Promise<Buffer>,
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

        const data = await transformData(req, user)
        if (!data) {
          return next()
        }

        const pdf = await generateFn(data, context)
        res
          .writeHead(200, {
            'Content-Length': Buffer.byteLength(pdf),
            'Content-Type': 'application/pdf',
          })
          .end(pdf)
      } catch (error) {
        console.error('error while generating pdf via invoice module', {
          error,
        })
        res.status(500).end()
      }
    }
  }
  function getPaymentPdfReqHandler(
    isApplicableFn: (payment: invoices.commons.PaymentResolved) => boolean,
    generateFn: (
      payment: invoices.commons.PaymentResolved,
      context: Context,
    ) => Promise<Buffer>,
  ) {
    return getPdfReqHandler(async (req, user) => {
      const { hrid } = req.params
      const payment = await invoices.commons.resolvePayment({ hrid }, context)

      if (!isApplicableFn(payment)) {
        return false
      }

      if (payment?.pledge?.userId !== user.id) {
        return false
      }
      return payment
    }, generateFn)
  }

  server.get(
    '/invoices/:hrid.pdf',
    getPaymentPdfReqHandler(
      invoices.invoice.isApplicable,
      invoices.invoice.generate,
    ),
  )

  server.get(
    '/invoices/paymentslip/:hrid.pdf',
    getPaymentPdfReqHandler(
      invoices.paymentslip.isApplicable,
      invoices.paymentslip.generate,
    ),
  )

  server.get(
    '/invoices/donationreceipt/:year.pdf',
    getPdfReqHandler(
      (req, user) => ({
        year: req.params.year,
        user,
      }),
      invoices.donationReceipt.generate,
    ),
  )
}

export default module.exports = middleware
