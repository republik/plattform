import { NextApiRequest, NextApiResponse } from 'next'
import HTTPMethods from './HTTPMethods'

type APIFunction = <T = unknown>(
  req: NextApiRequest,
  res: NextApiResponse<T>,
) => void

/**
 * Wraps a Next.js api-function and rejects requests
 * @constructor
 */
function withReqMethodGuard<T = unknown>(
  handler: APIFunction,
  acceptedMethods: HTTPMethods[],
): APIFunction {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // If the request method is not accepted, reject the request
    console.log('req.method', req.method)
    if (!req.method || !acceptedMethods.includes(req.method as HTTPMethods)) {
      console.log('Method guard hit')
      return res.status(405).end()
    } else {
      console.log('Method guard passed')
      return handler(req, res)
    }
  }
}

export default withReqMethodGuard
