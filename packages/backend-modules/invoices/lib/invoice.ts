import { utils, PDF } from 'swissqrbill'

import { Context } from '@orbiting/backend-modules-types'
import { formatPrice, timeFormat } from '@orbiting/backend-modules-formats'

import {
  IsApplicableFn,
  PaymentResolved,
  PaymentStatus,
  PledgeOption,
  User,
  Address,
  getReference,
  getSwissQrBillData,
  GenerateFn,
  Company,
  BankAccount,
} from './commons'
import * as paymentslip from './paymentslip'

interface RowConfig {
  bold?: boolean
}

const formatDate = timeFormat('%x')

const PADDING_MM = 20 // 2cm
const DEBTOR_INDENT_MM = 140 // 14cm
const REGULAR_FONT_SIZE = 11
const DEBTOR_FONT_SIZE = 11
const TITLE_FONT_SIZE = 16
const REGULAR_FONT_NAME = 'Helvetica'
const BOLD_FONT_NAME = 'Helvetica-Bold'

export const isApplicable: IsApplicableFn = function (payment) {
  if (!payment.id) {
    return false
  }

  if (![PaymentStatus.WAITING, PaymentStatus.PAID].includes(payment.status)) {
    return false
  }

  if (!payment.pledge.package.bankAccount?.canInvoice) {
    return false
  }

  return true
}

export function addTopLeftPadding(doc: PDF) {
  doc.x = doc.y = utils.mm2pt(PADDING_MM)
}

export function addCreditor(
  doc: PDF,
  company: Company,
  bankAccount: BankAccount,
  context: Context,
) {
  const { t } = context

  const companyName = company?.name
  const creditorAddress = bankAccount?.address
  const image = bankAccount?.image

  if (!creditorAddress) {
    throw new Error('Creditor address missing')
  }

  if (!Number(creditorAddress.postalCode)) {
    throw new Error('Creditor address postal code is not a number')
  }

  if (image) {
    // Use data URI instead of Buffer
    const dataUri = `data:image/*;base64,${image.toString('base64')}`

    doc.image(dataUri, { fit: [utils.mm2pt(10), 100] }).moveDown()
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
}

function getDebtorAddress(address: Address | undefined): string {
  if (!address) {
    return ''
  }

  const { name, line1, line2, postalCode, city } = address

  const string = [name, line1, line2, `${postalCode} ${city}`.trim()]
    .filter(Boolean)
    .join('\n')

  return string
}

function getDebtorEmail(user: User): string {
  const { firstName, lastName, email } = user

  return [`${firstName} ${lastName}`.trim(), email].filter(Boolean).join('\n')
}

export function addDebtor(doc: PDF, user: User) {
  const { x } = doc

  doc.x = utils.mm2pt(DEBTOR_INDENT_MM)

  doc
    .fontSize(DEBTOR_FONT_SIZE)
    .text(getDebtorAddress(user.address) || getDebtorEmail(user))
    .moveDown()

  doc.x = x
}

export function addTitle(doc: PDF, text: string) {
  doc
    .fontSize(TITLE_FONT_SIZE)
    .text(text)
    .fontSize(REGULAR_FONT_SIZE)
    .moveDown()
}

export function addBoldText(doc: PDF, text: string) {
  doc.font(BOLD_FONT_NAME).text(text).font(REGULAR_FONT_NAME)
}

function addMeta(doc: PDF, payment: PaymentResolved, context: Context) {
  const { t } = context

  const { method, status } = payment

  const metaFragmentPaymentMethod = t(`api/invoices/paymentMethod/${method}`)

  doc.moveDown(1.5)
  addTitle(doc, t.first([`api/invoices/${status}/title`, 'api/invoices/title']))

  doc
    .text(
      t.first([`api/invoices/${status}/meta`, 'api/invoices/meta'], {
        date: formatDate(payment.createdAt),
        reference: getReference(payment.hrid, true),
        paymentMethod: metaFragmentPaymentMethod,
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
  const font = config?.bold ? BOLD_FONT_NAME : REGULAR_FONT_NAME

  return {
    columns: [
      {
        text: option,
        font,
      },
      {
        text: units || '',
        width: utils.mm2pt(20),
        font,
      },
      {
        text: typeof rowTotal === 'number' ? formatPrice(rowTotal) : rowTotal,
        width: utils.mm2pt(30),
        font,
      },
    ],
  }
}

function getTableOptionRows(option: PledgeOption, context: Context) {
  const {
    price,
    periods,
    amount,
    option: { reward } = {},
    period: { beginDate, endDate, membership } = {},
  } = option
  const { t } = context

  const type = reward?.rewardType
  const name = reward?.name
  const interval = reward?.interval

  const pricePerUnit = price * (periods || 1)
  const rowTotal = amount * pricePerUnit

  const labelFragmentInterval = t.pluralize(
    `api/email/option/interval/${interval}/periods`,
    { count: periods },
  )

  const replacements = {
    count: amount,
    interval: labelFragmentInterval,
    sequenceNumber: membership?.sequenceNumber,
    period: beginDate && `${formatDate(beginDate)} - ${formatDate(endDate)}`,
  }

  const label = t.pluralize(`api/invoices/option/${type}/${name}`, replacements)

  const meta = t.first(
    [
      replacements.period &&
        `api/invoices/option/${type}/${name}/withPeriod/meta`,
      `api/invoices/option/${type}/${name}/meta`,
      replacements.period && `api/invoices/option/${type}/withPeriod/meta`,
      `api/invoices/option/${type}/meta`,
      `api/invoices/option/meta`,
    ].filter(Boolean),
    replacements,
    '',
  )

  return getTableRow(
    [label, meta].filter(Boolean).join('\n'),
    amount || 0,
    rowTotal,
  )
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

function addTable(doc: PDF, payment: PaymentResolved, context: Context) {
  const { t } = context

  const pledgeTotal = payment.pledge?.total || 0
  const companyName = payment?.pledge.package.company.name

  const header = getTableRow(
    t('api/invoices/table/option'),
    t('api/invoices/table/units'),
    t('api/invoices/table/rowTotal'),
  )

  // Relevant are only pledge options w/ rewards, like a Goodie or MembershipType
  const relevantOptions = payment.pledge?.options.filter(
    (option) => option.option?.reward,
  )

  const options =
    relevantOptions.map((option) => getTableOptionRows(option, context)) || []

  const rows = [header, ...options]

  const donationOrDiscount = getDonationOrDiscount(
    pledgeTotal,
    payment.pledge.donation,
    relevantOptions,
  )

  if (donationOrDiscount !== 0) {
    const type = donationOrDiscount > 0 ? 'donation' : 'discount'

    rows.push(
      getTableRow(t(`api/invoices/table/${type}`), null, donationOrDiscount),
    )
  }

  const total = getTableRow(
    t.first([
      `api/invoices/table/${companyName}/total`,
      'api/invoices/table/total',
    ]),
    null,
    pledgeTotal,
    {
      bold: true,
    },
  )

  rows.push(total)

  const padding: [number, number, number, number] = [0, 0, utils.mm2pt(5), 0]

  doc.moveDown().addTable({ padding, width: utils.mm2pt(170), rows })
}

export const generate: GenerateFn = function (payment, context) {
  if (!context) {
    throw new Error('context is required')
  }

  const data = getSwissQrBillData(payment)

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDF(data, '/dev/null', {
        autoGenerate: false,
        size: 'A4',
      })

      addTopLeftPadding(doc)
      addCreditor(
        doc,
        payment?.pledge.package.company,
        payment?.pledge.package.bankAccount,
        context,
      )
      addDebtor(doc, payment?.pledge.user)
      addMeta(doc, payment, context)
      addTable(doc, payment, context)

      if (paymentslip.isApplicable(payment)) {
        doc.addQRBill()
      }

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
