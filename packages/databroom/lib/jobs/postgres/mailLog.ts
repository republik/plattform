import { NICE_ROWS_LIMIT_FACTOR, NICE_ROWS_LIMIT_MINIMUM, processStream, Options, JobContext, JobFn } from '../../index'

interface SelectFields {
  id: string
  subject: string
  template: string
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
      const rowHandler = async function (row: SelectFields): Promise<any> {
        const { subject, template } = row

        const info = {
          message: {
            subject
          },
          template
        }

        handlerDebug('tidy info in %s: %o', row.id, info)

        await tx.public.mailLog.update(
          { id: row.id },
          { info }
        )

        return row.id
      }

      const batchHandler = async function (ids: string[]): Promise<void> {
        debug('updated %i rows', ids.length)
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
          `SELECT id, info->'message'->>'subject' "subject", info->>'template' "template"`,
          `FROM "mailLog"`,
          `WHERE "createdAt" < '${new Date(createdBefore).toISOString()}'`,
          `AND (info->'message'->>'to') IS NOT NULL`,
          nice && `LIMIT ${limit}`
        ].filter(Boolean).join(' '),
      )

      debug('processing stream with handler ...')
      await processStream(
        qryStream,
        { rowHandler, batchHandler },
      )
      debug('processing stream is done')

      const [seconds] = process.hrtime(hrstart)
      debug('duration: %ds', seconds)

      await (dryRun && tx.transactionRollback()) || tx.transactionCommit()
    } catch (e) {
      await tx.transactionRollback()
      throw e
    }
  }
}
