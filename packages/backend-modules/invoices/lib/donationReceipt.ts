import { GraphqlContext } from '@orbiting/backend-modules-types'
import { utils, PDF } from 'swissqrbill'
import moment from 'moment'
import 'moment/locale/de'
import { getCountryCode } from './commons'
import {
  addCreditor,
  addDebtor,
  addTitle,
  addBoldText,
  addTopLeftPadding,
} from './invoice'

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
    SELECT SUM(pay.total)
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
          amount: total / 100,
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

      const textOptions = {
        width: utils.mm2pt(150),
      }

      doc.moveDown(2)
      doc
        .text(
          `${bankAccountAddress.city}, ${moment()
            .locale('de')
            .format('D. MMMM YYYY')}`,
        )
        .moveDown()

      addTitle(doc, `Spendenbescheinigung ${cleanYear}`)

      doc
        .moveDown()
        .text(`Guten Tag ${user.name}`)
        .moveDown(1.5)
        .text('Gerne bestätigen wir Ihnen, dass Sie Lobbywatch.ch', {
          ...textOptions,
          continued: true,
        })

      addBoldText(
        doc,
        ` im Jahr ${cleanYear} mit einem Betrag von CHF ${(total / 100).toFixed(
          2,
        )} `,
        {
          ...textOptions,
          continued: true,
        },
      )

      doc
        .text(
          'unterstützt haben. Herzlichen Dank für Ihren Beitrag an unsere Arbeit!',
          textOptions,
        )
        .moveDown(1.5)

      doc
        .text(
          `Dieser Betrag umfasst alle Zuwendungen vom 1. Januar bis 31. Dezember ${cleanYear}. Der Verein Lobbywatch.ch ist gemäss Entscheid der Steuerverwaltung des Kantons Bern gemeinnützig und steuerbefreit. Folglich können Sie Ihre Zuwendungen an Lobbywatch.ch von den Steuern abziehen.`,
          textOptions,
        )
        .moveDown(3)

      addTitle(doc, `Attestation de don ${cleanYear}`)

      doc
        .moveDown()
        .text(`Bonjour ${user.name}`)
        .moveDown(1.5)
        .text(
          `C'est avec plaisir que nous vous confirmons que vous avez soutenu Lobbywatch.ch à hauteur de`,
          {
            ...textOptions,
            continued: true,
          },
        )

      addBoldText(doc, ` CHF ${(total / 100).toFixed(2)} en ${cleanYear}`, {
        ...textOptions,
        continued: true,
      })

      doc
        .text(
          '. Nous vous remercions chaleureusement de votre contribution à notre travail !',
          textOptions,
        )
        .moveDown(1.5)

      doc
        .text(
          `Ce montant comprend toutes les donations du 1er janvier au 31 décembre ${cleanYear}. L'association Lobbywatch.ch est reconnue d'utilité publique et exonérée d'impôts selon la décision de l'administration fiscale du canton de Berne. Par conséquent, vous pouvez déduire de vos impôts vos dons à Lobbywatch.ch.`,
          textOptions,
        )
        .moveDown(1.5)

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
