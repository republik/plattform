import { NextApiRequest, NextApiResponse } from 'next'
import HTTPMethods from './HTTPMethods'

type APIFunction = (req: NextApiRequest, res: NextApiResponse) => void

/**
 * Wraps a Next.js api-function and rejects requests with a non-accepted method
 * @constructor
 */
function withReqMethodGuard(
  handler: APIFunction,
  acceptedMethods: HTTPMethods[],
): APIFunction {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // If the request method is not accepted, reject the request
    // HTTPMethod has string values therefor we can use `as HTTPMethods`
    if (!acceptedMethods.includes(req.method as HTTPMethods)) {
      return res.status(405).end()
    } else {
      return handler(req, res)
    }
  }
}

export default withReqMethodGuard
