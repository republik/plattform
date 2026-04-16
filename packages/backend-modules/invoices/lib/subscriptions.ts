import { formatPrice, timeFormat } from '@orbiting/backend-modules-formats'
import { Context } from '@orbiting/backend-modules-types'
import PDFDocument from 'pdfkit'
import { Table } from 'swissqrbill/pdf'

type PDFDocument = typeof PDFDocument

// Types copied from backend-modules/payments/lib/types.ts
type Company = 'PROJECT_R' | 'REPUBLIK'

type InvoiceStatus = 'draft' | 'paid' | 'void' | 'refunded' | 'open'

type Invoice = {
  id: string
  hrId: string
  subscriptionId: string
  userId: string
  company: Company
  externalId: string
  metadata: Record<string, any>
  status: InvoiceStatus
  total: number
  totalBeforeDiscount: number
  totalDiscountAmount: number
  totalDiscountAmounts: any
  totalExcludingTax: number
  totalTaxAmounts: any
  totalTaxAmount: number
  discounts: string[]
  items: any
  periodStart: Date
  periodEnd: Date
  createdAt: Date
  updatedAt: Date
}

import utils from 'swissqrbill/utils'
import {
  Address,
  getReference,
  IsApplicableFn,
  PledgeOption,
  User,
} from './commons'

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
  const invoice = await pgdb.payments.invoices.findOne({ hrId: input.hrid })

  return invoice
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

function addMeta(
  doc: PDFDocument,
  { status, hrId, createdAt }: Invoice,
  { t }: Context,
) {
  doc
    .fontSize(TITLE_FONT_SIZE)
    .moveDown()
    .text(t.first([`api/invoices/${status}/title`, 'api/invoices/title']))
    .fontSize(REGULAR_FONT_SIZE)
    .moveDown()
    .text(
      t.first([`api/invoices/${status}/meta`, 'api/invoices/meta'], {
        date: formatDate(createdAt),
        reference: getReference(hrId, true),
        paymentMethod: '?????? TODO ??????',
      }),
    )
    .moveDown()
}

function getTableRow(
  option: string,
  units: number | null,
  rowTotal: number | string,
  config?: RowConfig,
) {
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
      },
    ],
  }
}

function getItemRow(item: Invoice['items'], context: Context) {
  const { t } = context

  // const replacements = {
  //   count: amount,
  //   interval: labelFragmentInterval,
  //   sequenceNumber: membership?.sequenceNumber,
  //   period: beginDate && `${formatDate(beginDate)} - ${formatDate(endDate)}`,
  // }

  const label = t(`api/invoices/option/MembershipType/${item.price.id}/1`)

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

  return getTableRow(label, item.quantity, item.amount)
}

function getDiscountRow(item: Invoice['discounts'], context: Context) {
  return getTableRow(item.coupon.name, null, -item.coupon.amount_off)
}

function getDonationOrDiscount(
  total: number,
  donation: number,
  options: PledgeOption[],
) {
  const optionsTotal = options.reduce((prev: number, option) => {
    const { price, periods, amount } = option

    const pricePerUnit = price * (periods || 1)
    const optionTotal = amount * pricePerUnit

    return prev + optionTotal
  }, 0)

  return donation + Math.max(0, total - optionsTotal - donation)
}

function addTable(doc: PDFDocument, invoice: Invoice, context: Context) {
  const { t } = context

  const totalAmount = invoice.total || 0
  const companyName = invoice.company

  const header = getTableRow(
    t('api/invoices/table/option'),
    t('api/invoices/table/units'),
    t('api/invoices/table/rowTotal'),
  )

  const items = invoice.items.map((item) => getItemRow(item, context)) || []

  const discounts =
    invoice.discounts?.map((discount) => getDiscountRow(discount, context)) ||
    []

  const rows = [header, ...items, ...discounts]

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
    t.first([
      `api/invoices/table/${companyName}/total`,
      'api/invoices/table/total',
    ]),
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
      addMeta(doc, invoice, context)
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
