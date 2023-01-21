import { GraphqlContext } from '@orbiting/backend-modules-types'
import { PDF } from 'swissqrbill'
import moment from 'moment'
import { getCountryCode } from './commons'
import { addCreditor, addDebtor, addTopLeftPadding } from './invoice'

export const generate = async function (
  { year, user }: any,
  context: GraphqlContext,
): Promise<Buffer> {
  if (!context) {
    throw new Error('context is required')
  }

  const company = await context.pgdb.public.companies.findOne({
    name: 'LOBBYWATCH',
  })
  const bankAccount = await context.pgdb.public.bankAccounts.findOne({
    companyId: company.id,
  })
  const bankAccountAddress = await context.pgdb.public.addresses.findOne({
    id: bankAccount.addressId,
  })

  const userWithAddress = {
    ...user,
  }
  if (user._raw.addressId) {
    userWithAddress.address = await context.pgdb.public.addresses.findOne({
      id: user._raw.addressId,
    })
  }

  const cleanYear = moment(year).format('YYYY')
  const total = await context.pgdb.queryOneField(
    `
    SELECT SUM(pay.total) / 100
    FROM payments pay
    JOIN "pledgePayments" pp ON pp."paymentId" = pay.id
    JOIN pledges p ON p.id = pp."pledgeId"
    WHERE
      p."userId" = :userId AND
      pay.status = 'PAID' AND
      pay."createdAt" AT TIME ZONE 'Europe/Zurich' >= :begin AND
      pay."createdAt" AT TIME ZONE 'Europe/Zurich' <= :end
  `,
    {
      begin: `${cleanYear}-01-01`,
      end: `${cleanYear}-12-31`,
      userId: user.id,
    },
  )

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDF(
        {
          currency: 'CHF',
          amount: total,
          creditor: {
            account: bankAccount.iban,
            name: bankAccountAddress.name,
            address: bankAccountAddress.line1,
            zip: bankAccountAddress.postalCode,
            city: bankAccountAddress.city,
            country: getCountryCode(bankAccountAddress.country),
          },
        },
        '/dev/null',
        {
          autoGenerate: false,
          size: 'A4',
        },
      )

      addTopLeftPadding(doc)
      addCreditor(
        doc,
        company,
        {
          ...bankAccount,
          address: bankAccountAddress,
        },
        context,
      )
      addDebtor(doc, userWithAddress)

      doc.text(total).moveDown()

      doc.end()

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', () => reject())
    } catch (e) {
      reject(e)
    }
  })
}
