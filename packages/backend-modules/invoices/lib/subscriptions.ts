import { formatPrice, timeFormat } from '@orbiting/backend-modules-formats'
import { Context } from '@orbiting/backend-modules-types'
import PDFDocument from 'pdfkit'
import type { Stripe } from 'stripe'
import { PDFRow, Table } from 'swissqrbill/pdf'

type PDFDocument = typeof PDFDocument

// Types copied from backend-modules/payments/lib/types.ts
type Company = 'PROJECT_R' | 'REPUBLIK'

type Invoice = {
  userId: string
  company: Company
} & Stripe.Invoice

import utils from 'swissqrbill/utils'
import {
  Address,
  getReference,
  IsApplicableFn,
  PledgeOption,
  User,
} from './commons'
import { StripeInvoiceService } from './StripeInvoiceService'

interface RowConfig {
  bold?: boolean
}

const formatDate = timeFormat('%x')

const PADDING_MM = 20 // 2cm
const CREDITOR_INDENT_MM = 140 // 14cm
const REGULAR_FONT_SIZE = 11
const DEBTOR_FONT_SIZE = 11
const TITLE_FONT_SIZE = 16
const REGULAR_FONT_NAME = 'Helvetica'
const BOLD_FONT_NAME = 'Helvetica-Bold'

export async function findInvoice(
  input: { hrid: string },
  { pgdb }: Context,
): Promise<Invoice | undefined> {
  const invoiceEntry = await pgdb.payments.invoices.findOne({
    hrId: input.hrid,
  })

  if (!invoiceEntry) {
    return undefined
  }

  const chargeEntry = await pgdb.payments.charges.findOne({
    invoiceId: invoiceEntry.id,
  })

  const invoiceService = new StripeInvoiceService()

  const [invoice, charge] = await Promise.all([
    invoiceService.getInvoice(
      invoiceEntry.company as Company,
      invoiceEntry.externalId,
    ),
    invoiceService.getCharge(
      chargeEntry.company as Company,
      chargeEntry.externalId,
    ),
  ])

  if (!invoice || !charge) {
    return undefined
  }

  return {
    ...invoice,
    // From our DB
    company: invoiceEntry.company,
    userId: invoiceEntry.userId,
  }
}

export const isApplicable: IsApplicableFn = function () {
  return true
}

function addTopLeftPadding(doc: PDFDocument) {
  doc.x = doc.y = utils.mm2pt(PADDING_MM)
}

function addCreditor(
  doc: PDFDocument,
  {
    companyName,
    creditorAddress,
    image,
  }: {
    companyName: string
    creditorAddress: Address
    image: Buffer | undefined
  },
  context: Context,
) {
  const { t } = context

  if (!creditorAddress) {
    throw new Error('Creditor address missing')
  }

  if (!Number(creditorAddress.postalCode)) {
    throw new Error('Creditor address postal code is not a number')
  }

  const { x } = doc

  doc.x = utils.mm2pt(CREDITOR_INDENT_MM)

  if (image) {
    // Use data URI instead of Buffer
    const dataUri = `data:image/*;base64,${image.toString('base64')}`

    doc.image(dataUri, { fit: [utils.mm2pt(45), 100] }).moveDown()
  }

  const address = [
    creditorAddress.name,
    creditorAddress.line1,
    creditorAddress.line2,
    `${Number(creditorAddress.postalCode)} ${creditorAddress.city}`,
  ]
    .filter(Boolean)
    .join('\n')

  doc
    .fontSize(REGULAR_FONT_SIZE)
    .text(
      t.first(
        [`api/invoices/creditor/${companyName}`, `api/invoices/creditor`],
        { address },
      ),
    )
    .moveDown()

  doc.x = x
}

function getDebtorAddress(address: Address | undefined): string {
  if (!address) {
    return ''
  }

  const { organization, name, line1, line2, postalCode, city } = address

  const string = [
    organization,
    name,
    line1,
    line2,
    `${postalCode} ${city}`.trim(),
  ]
    .filter(Boolean)
    .join('\n')

  return string
}

function addDebtor(
  doc: PDFDocument,
  { address, email }: { address: Address | undefined; email: string },
) {
  doc
    .fontSize(DEBTOR_FONT_SIZE)
    .text(getDebtorAddress(address) || email)
    .moveDown()
}

function addMeta(doc: PDFDocument, invoice: Invoice, { t }: Context) {
  doc
    .fontSize(TITLE_FONT_SIZE)
    .moveDown()
    .text(
      t.first([
        `api/invoices/${status?.toUpperCase()}/title`,
        'api/invoices/title',
      ]),
    )
    .fontSize(REGULAR_FONT_SIZE)
    .moveDown()
    .text(
      t.first(
        [`api/invoices/${status?.toUpperCase()}/meta`, 'api/invoices/meta'],
        {
          date: formatDate(createdAt),
          reference: getReference(hrId, true),
          paymentMethod: paymentMethodType ?? '',
        },
      ),
    )
    .moveDown()
}

function getTableRow(
  option: string,
  units: number | null,
  rowTotal: number | string,
  config?: RowConfig,
): PDFRow {
  const fontName = config?.bold ? BOLD_FONT_NAME : REGULAR_FONT_NAME

  return {
    fontName,
    columns: [
      {
        text: option,
      },
      {
        text: units || '',
        width: utils.mm2pt(20),
      },
      {
        text: typeof rowTotal === 'number' ? formatPrice(rowTotal) : rowTotal,
        width: utils.mm2pt(30),
        align: 'right',
      },
    ],
  }
}

function getItemRow(
  {
    item,
    invoice,
  }: {
    item: Invoice['lines']['data'][number]
    invoice: Invoice
  },
  context: Context,
): PDFRow {
  const { t } = context

  // const replacements = {
  //   count: amount,
  //   interval: labelFragmentInterval,
  //   sequenceNumber: membership?.sequenceNumber,
  //   period: beginDate && `${formatDate(beginDate)} - ${formatDate(endDate)}`,
  // }

  const label =
    item.pricing?.price_details?.price?.product?.name ??
    item.description ??
    'Transaktion'

  const period = item.period
    ? `${formatDate(new Date(item.period.start * 1000))} – ${formatDate(
        new Date(item.period.end * 1000),
      )}`
    : ''
  // const meta = t.first(
  //   [
  //     replacements.period &&
  //       `api/invoices/option/${type}/${name}/withPeriod/meta`,
  //     `api/invoices/option/${type}/${name}/meta`,
  //     replacements.period && `api/invoices/option/${type}/withPeriod/meta`,
  //     `api/invoices/option/${type}/meta`,
  //     `api/invoices/option/meta`,
  //   ].filter(Boolean),
  //   replacements,
  //   '',
  // )

  return getTableRow(
    `${label}${period ? `\n${period}` : ''}`,
    item.quantity,
    item.amount,
  )
}

function getDiscountRow(
  { name, amountOff }: { name: string; amountOff: number },
  context: Context,
): PDFRow {
  return getTableRow(name, null, -amountOff)
}

function addTable(doc: PDFDocument, invoice: Invoice, context: Context) {
  const { t } = context

  const totalAmount = invoice.total || 0

  const header = getTableRow(
    t('api/invoices/table/option'),
    t('api/invoices/table/units'),
    t('api/invoices/table/rowTotal'),
  )

  const items =
    invoice.lines.data.map((item) => getItemRow({ item, invoice }, context)) ||
    []

  const discounts =
    invoice.total_discount_amounts?.map((discountAmount) => {
      const discount = invoice.discounts.find((d) => {
        if (typeof d === 'string') {
          return false
          // return d === discountAmount.discount
        }

        return d.id === discountAmount.discount
      }) as Stripe.Discount | undefined

      return getDiscountRow(
        {
          name: discount?.coupon?.name ?? 'Rabatt',
          amountOff: discountAmount.amount,
        },
        context,
      )
    }) || []

  const taxes =
    invoice.total_taxes?.map((tax) => {
      return getTableRow(
        t('api/invoices/table/totalInclTaxes', {
          taxRate: tax.tax_rate_details?.tax_rate?.percentage,
        }),
        null,
        totalAmount,
        { bold: true },
      )
    }) ?? []

  const rows = [header, ...items, ...discounts, ...taxes]

  // const donationOrDiscount = getDonationOrDiscount(
  //   totalAmount,
  //   payment.pledge.donation,
  //   relevantOptions,
  // )

  // if (donationOrDiscount !== 0) {
  //   const type = donationOrDiscount > 0 ? 'donation' : 'discount'

  //   rows.push(
  //     getTableRow(t(`api/invoices/table/${type}`), null, donationOrDiscount),
  //   )
  // }
  //
  //

  const total = getTableRow(
    invoice.total_taxes?.length > 0
      ? t('api/invoices/table/totalInclTaxes', {
          taxRate:
            invoice.total_taxes?.[0].tax_rate_details?.tax_rate?.percentage,
        })
      : t('api/invoices/table/totalNoTaxes'),
    null,
    totalAmount,
    {
      bold: true,
    },
  )

  rows.push(total)

  const padding: [number, number, number, number] = [0, 0, utils.mm2pt(5), 0]

  const table = new Table({ padding, width: utils.mm2pt(170), rows })

  doc.moveDown()
  table.attachTo(doc)
}

export async function generate(
  invoice: Invoice,
  context: Context,
): Promise<Buffer> {
  const { pgdb } = context

  const company = await pgdb.public.companies.findOne({ name: invoice.company })

  const bankAccount =
    company &&
    (await pgdb.public.bankAccounts.findOne({
      companyId: company.id,
      default: true,
    }))

  const bankAccountAddress: Address =
    bankAccount?.addressId &&
    (await pgdb.public.addresses.findOne({ id: bankAccount.addressId }))

  const user: User =
    invoice?.userId && (await pgdb.public.users.findOne({ id: invoice.userId }))

  if (!user) {
    throw new Error('User not found')
  }

  const userAddress: Address =
    user?.addressId &&
    (await pgdb.public.addresses.findOne({ id: user.addressId }))

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
      })

      addTopLeftPadding(doc)
      addCreditor(
        doc,
        {
          companyName: company.name,
          creditorAddress: bankAccountAddress,
          image: bankAccount?.image,
        },
        context,
      )
      addDebtor(doc, { address: userAddress, email: user.email })
      // addMeta(doc, invoice, context)
      addTable(doc, invoice, context)

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
