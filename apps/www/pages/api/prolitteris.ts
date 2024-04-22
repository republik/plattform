import { NextApiRequest, NextApiResponse } from 'next'
import truncateIP from '../../lib/api/TruncateIP'
import withReqMethodGuard from '../../lib/api/withReqMethodGuard'
import HTTPMethods from '../../lib/api/HTTPMethods'
import crypto from 'node:crypto'
import { v4 } from 'uuid'

const {
  PROLITTERIS_MEMBER_ID,
  PROLITTERIS_DOMAIN,
  PROLITTERIS_USER_AGENT,
  PUBLIC_BASE_URL,
  PROLITTERIS_DEV_UID,
  PROLITTERIS_HASH_SECRET = '',
} = process.env

/**
 * Generate a sha256 hash from a string, number, object or array
 * @param input
 * @returns
 */
function getHash(input: string | number | object): string {
  const hash = crypto.createHash('sha256')
  if (input instanceof Object || Array.isArray(input)) {
    hash.update(JSON.stringify(input))
  } else {
    hash.update(input.toString())
  }
  hash.update(PROLITTERIS_HASH_SECRET)
  return hash.digest('hex')
}

/**
 * Returns a the IP of the request.
 * In case of multiple IPs (comma separated string or array) the first IP is returned.
 * If no IP is found, null is returned.
 * @param request
 * @returns IP address or null
 */
function getRequestIP(request: NextApiRequest): string | null {
  const requestIps =
    request.headers['x-forwarded-for'] || request.socket.remoteAddress

  if (Array.isArray(requestIps)) {
    return requestIps[0]
  }

  if (typeof requestIps === 'string' && requestIps.includes(',')) {
    return requestIps.split(',')[0].trim()
  }

  if (typeof requestIps === 'string') {
    return requestIps
  }

  return null
}

/**
 * Proxy a request to the ProLitteris API & anonymize the IP
 * @param req
 * @param res
 */
async function handler(request: NextApiRequest, response: NextApiResponse) {
  const requestIp = getRequestIP(request)

  const ua = request.headers['user-agent']
  const requestID = v4()

  // throw error if no IP is supplied
  if (!requestIp) {
    console.error(requestID, 'IP undefined')
    return response.status(400).json({
      body: 'IP undefined',
    })
  }

  // Query Parameters of request
  // 1) paid (string, 'pw' || 'na'): request by paying user (pw) or public (na)
  // 2) uid (string): repoId of the article
  // 3) path (string): article slug

  const { paid, uid, path } = request.query

  // Check that all query parameters are defined.
  if (!paid) {
    console.error(requestID, 'Paid parameter required.')
    return response.status(400).json({
      body: 'paid parameter required.',
    })
  }

  if (paid !== 'na' && paid !== 'pw') {
    console.error(
      requestID,
      'Paid parameter must be string "na" or "pw". Got',
      paid,
    )
    return response.status(400).json({
      body: "Paid parameter must be string 'na' or 'pw'",
    })
  }

  if (!uid || Array.isArray(uid)) {
    console.error(requestID, 'Uid parameter required. Got', uid)
    return response.status(400).json({
      body: ` ${
        Array.isArray(uid) ? 'multiple uid provided' : 'uid parameter required.'
      }`,
    })
  }

  if (!path) {
    console.error(requestID, 'Path parameter required.')
    return response.status(400).json({
      body: 'path parameter required.',
    })
  }

  // create unique C-Parameter for each request (20 characters hex) from the ip and user agent
  const cParam: string = getHash([requestIp, ua]).substring(0, 20)
  // replace repoID forward slash with dash, as forward slashes are not allowed in uid parameter
  const uidParam = PROLITTERIS_DEV_UID || uid.replace('/', '-')
  const maskedIP = truncateIP(requestIp)

  const fetchURL = new URL(
    `${PROLITTERIS_DOMAIN}` +
      `/${paid}/vzm.${PROLITTERIS_MEMBER_ID}-${uidParam}`,
  )
  fetchURL.searchParams.append('c', cParam)
  fetchURL.searchParams.append('i', maskedIP)

  const requestHeaders = {
    'User-Agent': PROLITTERIS_USER_AGENT,
    Referer: PUBLIC_BASE_URL + path,
  }

  return await fetch(fetchURL.toString(), {
    method: 'GET',
    headers: requestHeaders,
  })
    .then((res: Response) => {
      if (!res.ok) {
        console.error(requestID, 'Error', {
          status: res.status,
          statusText: res.statusText,
        })
      }
    })
    .catch((err: Error) => {
      console.error(requestID, 'Error', {
        err,
      })
    })
    .finally(() => {
      return response.status(204).send(null)
    })
}

export default withReqMethodGuard(handler, [HTTPMethods.GET, HTTPMethods.HEAD])
