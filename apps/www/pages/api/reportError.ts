import withReqMethodGuard from '../../lib/api/withReqMethodGuard'
import HTTPMethods from '../../lib/api/HTTPMethods'
import chalk from 'chalk'
import useragent from '../../server/useragent'
import { NextApiRequest, NextApiResponse } from 'next'

export default withReqMethodGuard(
  async (req: NextApiRequest, res: NextApiResponse) => {
    const userAgentValue = req.headers['user-agent']

    console.warn(
      chalk.yellow(
        'reportError from',
        useragent(userAgentValue),
        JSON.stringify(req.body),
      ),
    )
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({ ack: true })
  },
  [HTTPMethods.POST],
)
