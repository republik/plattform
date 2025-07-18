import { pino, type Logger as PinoLogger } from 'pino'
import { pinoHttp } from 'pino-http'
import { randomUUID } from 'node:crypto'

export type Logger = PinoLogger

const TRANSPORTS = {
  DEV: { target: 'pino-pretty' },
  HEKOKU_LOGDNA: {
    target: 'pino-logdna',
    options: {
      key: LOGDNA_KEY(),
    },
  },
  DEFAULT: undefined,
}

function LOGDNA_KEY() {
  try {
    if (process.env.LOGDNA_KEY) {
      const key = JSON.parse(process.env.LOGDNA_KEY)
      if (Array.isArray(key)) {
        return key[0]
      }
      return key
    }
  } catch (error) {
    console.error('Error fetching LOGDNA_KEY:', error)
    return false
  }
}

function getENV(): 'DEV' | 'HEKOKU_LOGDNA' | 'DEFAULT' {
  if (process.env.NODE_ENV !== 'production') return 'DEV'
  if (process.env.NODE_ENV === 'production' && LOGDNA_KEY())
    return 'HEKOKU_LOGDNA'
  return 'DEFAULT'
}

export const logger = pino({
  // Use pino-pretty for development
  transport: TRANSPORTS[getENV()],
})

export const httpLogger = pinoHttp({
  logger,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
    ],
    censor: 'REDACTED',
  },
  genReqId: function (req: any, res: any) {
    const existingID = req.id ?? req.headers['x-request-id']
    if (existingID) return existingID
    const id = randomUUID()
    res.setHeader('X-Request-Id', id)
    return id
  },
  // Define custom serializers
  serializers: {
    // Exclude sensitive headers
    // req(req: any) {
    //   return req
    // },
  },
})
