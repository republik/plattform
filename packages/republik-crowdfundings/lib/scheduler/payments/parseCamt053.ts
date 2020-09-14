import parser from 'fast-xml-parser'
import { Nominal } from 'simplytyped'

type Amount = Nominal<string, 'amount'>
type AmountInCents = Nominal<number, 'cents'>
type Avisierungstext = Nominal<string, 'avisierungstext'>
enum DebitCreditIndicator {
  DEBIT = 'DBIT',
  CREDIT = 'CRDT',
}

type Entry = CreditEntry | DebitEntry

interface DebitEntry {
  CdtDbtInd: DebitCreditIndicator.DEBIT
}

interface CreditEntry {
  Amt: Amount
  CdtDbtInd: DebitCreditIndicator.CREDIT
  BookgDt: {
    Dt: BookingDate
  }
  BkTxCd: TransactionCode
  ValDt: {
    Dt: ValutaDate
  }
  NtryDtls?: {
    TxDtls?: TransactionDetails | TransactionDetails[]
  }
  AddtlNtryInf?: Avisierungstext
}

type TransactionDetails = {
  CdtDbtInd: 'CRDT'
  RltdPties?: RelatedParties
  Refs?: {
    InstrId?: string
  }
  RmtInf?: { Ustrd?: string | string[] }
}

type TransactionCode =
  | Interbank
  | AutomaticTransfer
  | CreditAdjustments
  | DomesticCreditTransfer
  | CashTransaction
  | DebitCardPayment

type Interbank = Domain<'RCDT', 'ATXN'>
type AutomaticTransfer = Domain<'RCDT', 'AUTT'>
type DomesticCreditTransfer = Domain<'RCDT', 'DMCT'>
type CreditAdjustments = Domain<'RCDT', 'CAJT'>
type CashTransaction = Domain<'CNTR', 'CDPT'>
type DebitCardPayment = Domain<'CCRD', 'POSD'>

type Domain<F, SF> = {
  Domn: {
    Cd: 'PMNT'
    Fmly: {
      Cd: F
      SubFmlyCd: SF
    }
  }
}

type IbanDebitor = Nominal<'string', 'iban-debitor'>
export type IbanCreditor = Nominal<'string', 'iban-creditor'>

interface RelatedParties {
  Dbtr?: {
    Nm?: Name
    PstlAdr?: PostalAddress
  }
  DbtrAcct?: {
    Id?: {
      IBAN?: IbanDebitor
    }
  }
  CdtrAcct: {
    Id: {
      IBAN: IbanCreditor
    }
  }
}

type Name = string

type PostalAddress = StructuredPostalAddress | UnstructuredPostalAddress

type UnstructuredPostalAddress = {
  AdrLine:
    | AddressLine
    | [AddressLine, AddressLine]
    | [AddressLine, AddressLine, AddressLine]
    | [AddressLine, AddressLine, AddressLine, AddressLine]
}

type AddressLine = string

interface StructuredPostalAddress {
  StrtNm: string
  BldgNb: string
  PstCd: string
  TwnNm: string
  Ctry: string
}

interface Statement {
  Acct: {
    Id: {
      IBAN: IbanCreditor
    }
    Ownr: {
      Nm: string // 'Project R Genossenschaft Zürich'
    }
  }
  Ntry: Entry | Entry[]
}

interface Camt053 {
  Document: {
    BkToCstmrStmt: {
      Stmt: Statement | Statement[]
    }
  }
}

type BookingDate = Nominal<string, 'booking'>
type ValutaDate = Nominal<string, 'valuta'>

function first<X>(x: X | X[]) {
  return ensureArray(x)[0]
}

function ensureArray<X>(x: X | X[]) {
  if (Array.isArray(x)) {
    return x
  }
  return [x]
}

export interface PaymentEntry {
  debitorName: string | null
  imageReference: string | null
  buchungsdatum: Date
  valuta: Date
  avisierungstext: Avisierungstext
  gutschrift: AmountInCents
  mitteilung: string | null
  iban: IbanCreditor
  isDebitCardPayment: boolean
  isStripe: boolean
  isPayPal: boolean
}

export function parseCamt053(s: string): PaymentEntry[] {
  const { iban, creditEntries } = parseXml(s)

  return creditEntries.map((creditEntry) => {
    const avisierungstext = getAvisierungstext(creditEntry)

    if (!avisierungstext) {
      throw new Error(
        `\`Avisierungstext\` is missing in the following entry: ${JSON.stringify(
          creditEntry,
        )}`,
      )
    }

    const transactionDetails = getTransactionDetails(creditEntry)
    const debitorName = getName(transactionDetails)

    return {
      debitorName,
      isDebitCardPayment: isDebitCardPayment(creditEntry),
      isPayPal: matchDebitor('PAYPAL', debitorName, avisierungstext),
      isStripe: matchDebitor('STRIPE', debitorName, avisierungstext),
      imageReference: getImageReference(creditEntry),
      buchungsdatum: getBuchungsdatum(creditEntry),
      valuta: getValuta(creditEntry),
      avisierungstext,
      gutschrift: toCents(creditEntry.Amt),
      iban,
      mitteilung: getMitteilung(avisierungstext, transactionDetails),
    }
  })
}

function getName(transactionDetails?: TransactionDetails) {
  return transactionDetails?.RltdPties?.Dbtr?.Nm || null
}

function getTransactionDetails(creditEntry: CreditEntry) {
  return first(creditEntry.NtryDtls?.TxDtls)
}

function parseXml(s: string) {
  const { Document } = parser.parse(s, {
    parseNodeValue: false,
    ignoreAttributes: true,
  }) as Camt053

  const statement = getStatement(Document)
  const iban = getIban(statement)
  const entries = ensureArray(statement.Ntry)
  const creditEntries = []

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]
    if (entry.CdtDbtInd !== DebitCreditIndicator.CREDIT) continue
    creditEntries.push(entry)
  }

  return { iban, creditEntries }
}

function getStatement(Document: {
  BkToCstmrStmt: {
    Stmt: Statement | Statement[]
  }
}) {
  return first(Document.BkToCstmrStmt.Stmt)
}

function getIban(statement: Statement) {
  return statement.Acct.Id.IBAN
}

function getBuchungsdatum(creditEntry: CreditEntry): Date {
  return new Date(creditEntry.BookgDt.Dt)
}

function getValuta(creditEntry: CreditEntry): Date {
  return new Date(creditEntry.ValDt.Dt)
}

function getMitteilung(
  avisierungstext: Avisierungstext,
  transactionDetails?: TransactionDetails,
): string | null {
  const match = avisierungstext.match(
    /.*?MITTEILUNGEN:.*?\s([A-Za-z0-9]{6})(\s.*?|$)/,
  )

  if (match) return match[1]

  let remittanceInformation = transactionDetails?.RmtInf?.Ustrd
  if (!remittanceInformation) {
    return null
  }

  if (Array.isArray(remittanceInformation)) {
    remittanceInformation = remittanceInformation.join(' ')
  }

  return remittanceInformation?.match(/\b([A-Za-z0-9]{6})\b/)?.[1] || null
}

function getAvisierungstext(creditEntry: CreditEntry): Avisierungstext | void {
  return creditEntry.AddtlNtryInf
}

function getImageReference(creditEntry: CreditEntry): null | string {
  if (!isCashDeposit(creditEntry)) {
    return null
  }

  const transactionDetails = getTransactionDetails(creditEntry)

  if (!transactionDetails?.Refs?.InstrId) {
    throw new Error(
      `Import failed: the following over the counter cash deposit (Einzahlungsschein) came without a reference to the image: ${getAvisierungstext(
        creditEntry,
      )}`,
    )
  }
  return transactionDetails.Refs.InstrId
}

function isCashDeposit(creditEntry: CreditEntry) {
  return (
    creditEntry.BkTxCd.Domn.Fmly.Cd === 'CNTR' &&
    creditEntry.BkTxCd.Domn.Fmly.SubFmlyCd === 'CDPT'
  )
}

function isDebitCardPayment(creditEntry: CreditEntry) {
  return (
    creditEntry.BkTxCd.Domn.Fmly.Cd === 'CCRD' &&
    creditEntry.BkTxCd.Domn.Fmly.SubFmlyCd === 'POSD'
  )
}

function toCents(s: Amount): AmountInCents {
  const n = parseFloat(s)
  if (isNaN(n)) throw new Error(`Amount is not a number: ${n}`)
  return (n * 100) as AmountInCents
}

function matchDebitor(
  needle: string,
  debitorName: string | null,
  avisierungstext: Avisierungstext,
): boolean {
  const regexp = new RegExp(`^${needle}`, 'i')

  if (debitorName?.match(regexp)) return true

  const [, firstWord = ''] =
    avisierungstext.match(/GUTSCHRIFT VON FREMDBANK AUFTRAGGEBER: (\w+)/) || []
  return !!firstWord.match(regexp)
}
