import { processStream, Options, DatabroomContext, Job } from '../../index'

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
const NICE_ROW_LIMIT = 100

export default module.exports = function setup(options: Options, context: DatabroomContext): Job {
  const { pgdb, debug } = context
  const { dryRun, nice } = options
  const now = new Date()

  return {
    async clean() {
      const tx = await pgdb.transactionBegin()
      try {
        const createdBefore = now.setDate(now.getDate() - AGE_DAYS)
        const handler = async function (row: MailLog): Promise<void> {
          debug('tidy info json in %s', row.id)

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

        debug('processing stream with handler ...')
        await processStream(
          await pgdb.queryAsStream(
            [
              `SELECT * FROM "mailLog"`,
              `WHERE "createdAt" < '${new Date(createdBefore).toISOString()}'`,
              `AND (info->'message'->>'to') IS NOT NULL`,
              nice && `LIMIT ${NICE_ROW_LIMIT}`
            ].filter(Boolean).join(' '),
          ),
          handler,
        )
        debug('processing stream is done')

        await tx.transactionCommit()
      } catch (e) {
        await tx.transactionRollback()
        throw e
      }
    },
  }
}
