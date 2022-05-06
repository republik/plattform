import { NextApiRequest, NextApiResponse } from 'next'
import HTTPMethods from './HTTPMethods'

type APIFunction = (req: NextApiRequest, res: NextApiResponse) => void

/**
 * Wraps a Next.js api-function and rejects requests
 * @constructor
 */
function withReqMethodGuard(
  handler: APIFunction,
  acceptedMethods: HTTPMethods[],
): APIFunction {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // If the request method is not accepted, reject the request
    console.log('req.method', req.method)
    // HTTPMethod has string values therefor we can use `as HTTPMethods`
    if (!req.method || !acceptedMethods.includes(req.method as HTTPMethods)) {
      return res.status(405).end()
    } else {
      return handler(req, res)
    }
  }
}

export default withReqMethodGuard
