import { pino, type Logger as PinoLogger } from 'pino'
import { pinoHttp } from 'pino-http'
import { randomUUID } from 'node:crypto'

export type Logger = PinoLogger

const TRANSPORTS = {
  DEV: { target: 'pino-pretty' },
  DEFAULT: undefined,
}

function getENV(): 'DEV' | 'DEFAULT' {
  if (process.env.NODE_ENV !== 'production') return 'DEV'
  return 'DEFAULT'
}

const LOG_LABELS = new Map([
  [10, 'TRACE'],
  [20, 'DEBUG'],
  [30, 'INFO'],
  [40, 'WARN'],
  [50, 'ERROR'],
  [60, 'FATAL'],
])

export const logger = pino({
  transport: TRANSPORTS[getENV()],
  level: process.env.LOG_LEVEL || (getENV() === 'DEV' ? 'debug' : 'info'),
  formatters: {
    level(label: string, number: number) {
      return { level: LOG_LABELS.get(number) || label }
    },
  },
  // make msg key logDNA compliant
  messageKey: 'message',
})

export const httpLogger = pinoHttp({
  logger,
  msgPrefix: '[HTTP] ',
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
  // only log requestID for child logs
  quietReqLogger: true,
})
