import withReqMethodGuard from '../../lib/api/withReqMethodGuard'
import HTTPMethods from '../../lib/api/HTTPMethods'
import { NextApiRequest, NextApiResponse } from 'next'
import reportError from '../../lib/errors/reportError'

export default withReqMethodGuard(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const userAgentValue = req.headers['user-agent']

    reportError(userAgentValue, req.body)
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({ ack: true })
  },
  [HTTPMethods.POST],
)
