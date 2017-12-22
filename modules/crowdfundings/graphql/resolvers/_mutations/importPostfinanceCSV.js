const { Roles } = require('@orbiting/backend-modules-auth')
const logger = console
const matchPayments = require('../../../lib/payments/matchPayments')
const {dsvFormat} = require('d3-dsv')
const csvParse = dsvFormat(';').parse

const parsePostfinanceExport = (inputFile) => {
  // sanitize input
  // trash first 4 lines as they contain another table with (Buchungsart, Konto, etc)
  // keys to lower case
  // trash uninteresting columns
  // parse columns
  // extract mitteilung
  const includeColumns = ['Buchungsdatum', 'Valuta', 'Avisierungstext', 'Gutschrift']
  const parseDate = ['Buchungsdatum', 'Valuta']
  const parseAmount = ['Gutschrift']

  return csvParse(inputFile.split(/\r\n/).slice(6).join('\n'))
    .filter(row => row.Gutschrift) // trash rows without gutschrift (such as lastschrift and footer)
    .filter(row => !/^EINZAHLUNGSSCHEIN/g.exec(row.Avisierungstext)) // trash useless EINZAHLUNGSSCHEIN
    .filter(row => !/^GUTSCHRIFT E-PAYMENT TRANSAKTION POSTFINANCE CARD/g.exec(row.Avisierungstext)) // trash PF CARD
    .filter(row => !/^GUTSCHRIFT VON FREMDBANK (.*?) AUFTRAGGEBER: STRIPE/g.exec(row.Avisierungstext)) // trash stripe payments
    .map(row => {
      let newRow = {}
      Object.keys(row).forEach(key => {
        const value = row[key]
        if (includeColumns.indexOf(key) > -1) {
          const newKey = key.toLowerCase()
          if (parseDate.indexOf(key) > -1) {
            newRow[newKey] = new Date(value) // dates are ISO Dates (2017-08-17)
          } else if (parseAmount.indexOf(key) > -1) {
            newRow[newKey] = parseInt(parseFloat(value) * 100)
          } else {
            if (key === 'Avisierungstext') {
              try {
                newRow['mitteilung'] = /.*?MITTEILUNGEN:.*?\s([A-Za-z0-9]{6})(\s.*?|$)/g.exec(value)[1]
              } catch (e) {
                // console.log("Cloud not extract mitteilung from row:")
                // console.log(row)
              }
            }
            newRow[newKey] = value
          }
        }
      })
      return newRow
    })
}

const LOG_FAILED_INSERTS = false

const insertPayments = async (paymentsInput, tableName, pgdb) => {
  const numPaymentsBefore = await pgdb.public[tableName].count()
  let numFailed = 0
  await Promise.all(
    paymentsInput.map(payment => {
      return pgdb.public[tableName].insert(payment)
        .then(() => { return {payment, status: 'resolved'} })
        .catch(e => { numFailed += 1; return {payment, e, status: 'rejected'} })
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

module.exports = async (_, args, {pgdb, req, t}) => {
  Roles.ensureUserHasRole(req.user, 'accountant')
  const { csv } = args

  const input = Buffer.from(csv, 'base64').toString()

  const paymentsInput = parsePostfinanceExport(input)
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
    } = await matchPayments(transaction, t)

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
    logger.info('transaction rollback', { req: req._log(), args, error: e })
    throw e
  }
}
