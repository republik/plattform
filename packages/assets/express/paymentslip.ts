import { Express } from 'express'
// import * as invoices from '@orbiting/backend-modules-invoices'
import { paymentslip } from '@orbiting/backend-modules-invoices'

module.exports = (server: Express) => {
  server.get('/paymentslip', async (_req, res) => {
    res.setHeader('Content-type', 'application/pdf')
    const data = await paymentslip.generate()

    res
      .writeHead(200, {
        'Content-Length': Buffer.byteLength(data),
        'Content-Type': 'application/pdf',
      })
      .end(data)
  })
}
