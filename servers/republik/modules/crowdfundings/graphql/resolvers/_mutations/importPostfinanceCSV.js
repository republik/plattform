const { Roles } = require('@orbiting/backend-modules-auth')
const debug = require('debug')('crowdfundings:importPostfinanceCSV')
const matchPayments = require('../../../lib/payments/matchPayments')
const { dsvFormat } = require('d3-dsv')
const csvParse = dsvFormat(';').parse

const parsePostfinanceExport = async (inputFile, pgdb) => {
  const fields = [
    {
      name: 'buchungsdatum', // field in database
      pattern: /^Buchungsdatum/, // pattern to match row keys
      transform: v => new Date(v)
    },
    {
      name: 'valuta',
      pattern: /^Valuta/,
      transform: v => new Date(v)
    },
    {
      name: 'avisierungstext',
      pattern: /^Avisierungstext/
    },
    {
      name: 'mitteilung',
      pattern: /^Avisierungstext/,
      transform: v => {
        if (!v) {
          throw new Error('"Avisierungstext" not available')
        }

        const match = v.match(/.*?MITTEILUNGEN:.*?\s([A-Za-z0-9]{6})(\s.*?|$)/)
        return match ? match[1] : null
      }
    },
    {
      name: 'gutschrift',
      pattern: /^Gutschrift/,
      transform: v => {
        if (!v) {
          throw new Error('"Gutschrift" not available')
        }

        return parseInt(parseFloat(v) * 100)
      }
    }
  ]

  const delimitedFile = inputFile.split(/\r\n/)

  const iban = delimitedFile.slice(0, 5).reduce((acc, row) => {
    const parsedRow = row.match(/^Konto:;([A-Z0-9]{5,34})/)

    if (!parsedRow) {
      return acc
    }

    return parsedRow[1]
  }, false)

  console.log(iban)

  if (!iban) {
    throw new Error('Unable to find IBAN in provided file.')
  }

  const bankAccount = await pgdb.public.bankAccounts.findOne({ iban })
  if (!bankAccount) {
    throw new Error(
      `Unable to determine bank account for IBAN "${iban}" in provided file.`
    )
  }

  return csvParse(delimitedFile.slice(3).join('\n'))
    .filter(row => !/^GUTSCHRIFT E-PAYMENT TRANSAKTION POSTFINANCE CARD/g.exec(row.Avisierungstext)) // trash PF CARD
    .filter(row => !/^GUTSCHRIFT VON FREMDBANK AUFTRAGGEBER: (STRIPE|PAYPAL)/ig.exec(row.Avisierungstext)) // trash stripe payments
    .map(row => {
      const parsed = {}

      Object.keys(row).forEach(key => {
        fields.forEach(({ name, pattern, transform = v => v }) => {
          const value = row[key]

          if (key.match(pattern)) {
            try {
              parsed[name] = transform(value)
            } catch (e) {
              // Remove row hereafter
              console.warn(e.message)
              debug(e.message, { row })
              parsed.remove = true
            }
          }
        })
      })

      parsed.bankAccountId = bankAccount.id

      return parsed
    })
    .filter(row => !row.remove)
}

const LOG_FAILED_INSERTS = false

const insertPayments = async (paymentsInput, tableName, pgdb) => {
  const numPaymentsBefore = await pgdb.public[tableName].count()
  let numFailed = 0
  await Promise.all(
    paymentsInput.map(payment => {
      return pgdb.public[tableName].insert(payment)
        .then(() => { return { payment, status: 'resolved' } })
        .catch(e => { numFailed += 1; return { payment, e, status: 'rejected' } })
    })
  ).then(results => {
    if (LOG_FAILED_INSERTS) {
      const rejected = results.filter(x => x.status === 'rejected')
      rejected.forEach(promise => {
        console.log('could not insert row:')
        console.log(promise.e.message)
        console.log(promise.payment)
        console.log('---------------------')
      })
    }
  })
  if (LOG_FAILED_INSERTS) {
    console.log(`Failed to insert ${numFailed} payments.`)
  }
  return numPaymentsBefore
}

module.exports = async (_, args, { pgdb, req, t, redis }) => {
  Roles.ensureUserHasRole(req.user, 'accountant')
  const { csv } = args

  const input = Buffer.from(csv, 'base64').toString()

  const paymentsInput = await parsePostfinanceExport(input, pgdb)
  if (paymentsInput.length === 0) {
    return 'input empty. done nothing.'
  }

  // insert into db
  // this is done outside of transaction because it's
  // ment to throw on duplicate rows and doesn't change other records
  const numPaymentsBefore = await insertPayments(paymentsInput, 'postfinancePayments', pgdb)
  const numPaymentsAfter = await pgdb.public.postfinancePayments.count()

  const transaction = await pgdb.transactionBegin()
  try {
    const {
      numMatchedPayments,
      numUpdatedPledges,
      numPaymentsSuccessful
    } = await matchPayments(transaction, t, redis)

    await transaction.transactionCommit()

    const result = `
importPostfinanceCSV result:
num new payments: ${numPaymentsAfter - numPaymentsBefore}
num matched payments: ${numMatchedPayments}
num updated pledges: ${numUpdatedPledges}
num payments successfull: ${numPaymentsSuccessful}
    `
    console.log(result)
    return result
  } catch (e) {
    await transaction.transactionRollback()
    console.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
