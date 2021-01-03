import { NICE_ROWS_LIMIT_FACTOR, NICE_ROWS_LIMIT_MINIMUM, processStream, Options, JobContext, JobFn } from '../../index'

interface MailLog {
  id: string
  info: {
    message?: {
      subject?: string
    }
    template?: string
  }
}

const AGE_DAYS = 90

export default module.exports = function setup(options: Options, context: JobContext): JobFn {
  const { pgdb, debug } = context
  const { dryRun, nice } = options
  const now = new Date()

  return async function() {
    const hrstart = process.hrtime()
    const tx = await pgdb.transactionBegin()

    try {
      const createdBefore = now.setDate(now.getDate() - AGE_DAYS)

      debug('table: mailLog')
      debug('conditions: %o', { createdBefore })

      const handlerDebug = debug.extend('handler')
      const handler = async function (row: MailLog): Promise<void> {
        handlerDebug('tidy info in %s', row.id)

        if (!dryRun) {
          const info = {
            message: {
              subject: row.info?.message?.subject
            },
            template: row.info?.template
          }

          await tx.public.mailLog.update(
            { id: row.id },
            { info }
          )
        }
      }

      debug('counting rows ...')
      const count = await pgdb.queryOneField(
        [
          `SELECT COUNT(*) FROM "mailLog"`,
          `WHERE "createdAt" < '${new Date(createdBefore).toISOString()}'`,
          `AND (info->'message'->>'to') IS NOT NULL`,
        ].filter(Boolean).join(' '),
      )
      debug('%i rows found', count)

      const limit = Math.max(
        Math.ceil(count * NICE_ROWS_LIMIT_FACTOR),
        NICE_ROWS_LIMIT_MINIMUM,
      )

      if (nice) {
        debug('be nice, limit to %i rows', limit)
      }

      const qryStream = await pgdb.queryAsStream(
        [
          `SELECT * FROM "mailLog"`,
          `WHERE "createdAt" < '${new Date(createdBefore).toISOString()}'`,
          `AND (info->'message'->>'to') IS NOT NULL`,
          nice && `LIMIT ${limit}`
        ].filter(Boolean).join(' '),
      )

      debug('processing stream with handler ...')
      await processStream(
        qryStream,
        handler,
      )
      debug('processing stream is done')

      const [seconds] = process.hrtime(hrstart)
      debug('duration: %ds', seconds)

      await tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }
}
