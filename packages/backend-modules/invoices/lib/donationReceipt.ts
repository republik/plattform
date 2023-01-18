import { GraphqlContext } from '@orbiting/backend-modules-types'
import { PDF } from 'swissqrbill'
import { getCountryCode } from './commons'

export const generate = async function (
  { year, user },
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

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDF(
        {
          currency: 'CHF',
          amount: 1,
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

      doc.end()

      const buffers: Buffer[] = []
      doc.on('data', buffers.push.bind(buffers))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      doc.on('error', () => reject())
    } catch (e) {
      reject(e)
    }
  })

  return
}
