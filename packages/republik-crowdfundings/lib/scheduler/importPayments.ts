import toArray from 'stream-to-array'
import { PassThrough } from 'stream'
import sharp from 'sharp'
import { PgTable, PgDb } from 'pogi'
import { keyBy, Dictionary } from 'lodash'
import tar, { ParseStream } from 'tar'
import {
  parseCamt053,
  IbanCreditor,
  PaymentEntry,
} from './payments/parseCamt053'

import { Nominal } from 'simplytyped'
import { v4 as uuid } from 'uuid'
import matchPayments, { MatchPaymentReport } from '../payments/matchPayments'
import { SftpFile } from './payments/sftp'
import { syncPaymentFiles } from './payments/syncPaymentFiles'

const {
  publishScheduler,
  publishFinance,
}: {
  publishScheduler: (message: string) => Promise<void>
  publishFinance: (message: string) => Promise<void>
} = require('@orbiting/backend-modules-republik/lib/slack')

interface Context {
  pgdb: PgDb
  redis: any
  t: any
}

export async function importPayments(
  _args: undefined,
  context: Context,
): Promise<void> {
  try {
    await withTransaction(syncPaymentFiles, context.pgdb)
    const report = await withTransaction(
      createPaymentImporter(context),
      context.pgdb,
    )
    await notifyAccountants(report)
    await sendReminders()
  } catch (e) {
    await informFailed(
      `importPayments(): postfinance sync failed with the following error: ${
        e.message || e
      } ${e.stack || ''}`,
    )
    return
  }
}

const createPaymentImporter = (context: Context) => async (
  transaction: PgDb,
): Promise<Report> => {
  const insertPaymentReport = await insertNewPayments(transaction)
  const matchingReport = await tryMatchingPayments(transaction, context)
  const unmatchedPaymentsAmount = await getUnmatchedPaymentsAmount(transaction)

  return {
    ...insertPaymentReport,
    matchingReport,
    unmatchedPaymentsAmount,
  }
}

async function withTransaction<T>(
  fn: (pgdb: PgDb) => Promise<T>,
  pgdb: PgDb,
): Promise<T> {
  const transaction = await pgdb.transactionBegin()
  try {
    const result = await fn(transaction)
    await transaction.transactionCommit()
    return result
  } catch (e) {
    await transaction.transactionRollback()
    throw e
  }
}

interface Report {
  unmatchedPaymentsAmount: number
  paymentsImported: number
  filesImported: number
  matchingReport?: MatchPaymentReport
}

async function notifyAccountants({
  unmatchedPaymentsAmount,
  paymentsImported,
  filesImported,
  matchingReport,
}: Report) {
  const report: string[] = [
    `🏦 Postfinance import done.`,
    `📄 ${filesImported} file${filesImported === 1 ? '' : 's'} imported.`,
    `💵 ${paymentsImported} payment${
      paymentsImported === 1 ? '' : 's'
    } imported.`,
    '',
  ]

  if (matchingReport) {
    const {
      numMatchedPayments,
      numPaymentsSuccessful,
      numUpdatedPledges,
    } = matchingReport
    report.push(
      ...[
        `${numMatchedPayments} payment${
          numMatchedPayments === 1 ? '' : 's'
        } matched.`,
        `${numPaymentsSuccessful} payment${
          numPaymentsSuccessful === 1 ? '' : 's'
        } successful.`,
        `${numUpdatedPledges} pledge${
          numUpdatedPledges === 1 ? '' : 's'
        } updated.`,
      ],
    )
  }

  if (unmatchedPaymentsAmount === 0) {
    report.push(...['', `👍 All payments matched!`])
    return publishFinance(report.join('\n'))
  }

  const payment = unmatchedPaymentsAmount === 1 ? 'payment' : 'payments'
  const needs = unmatchedPaymentsAmount === 1 ? 'needs' : 'need'

  report.push(
    ...[
      '',
      `‼️ ${unmatchedPaymentsAmount} ${payment} ${needs} to be matched:`,
      '{ADMIN_FRONTEND_BASE_URL}/postfinance-payments?bool=matched_false',
    ],
  )

  await publishFinance(report.join('\n'))
}

async function getUnmatchedPaymentsAmount(pgdb: PgDb) {
  return (await pgdb.queryOneField(
    'select count(*) from "postfinancePayments" where matched = false and hidden is not true;',
  )) as number
}

async function sendReminders() {
  console.log('TODO send reminders')
}

async function tryMatchingPayments(
  transaction: PgDb,
  context: Context,
): Promise<MatchPaymentReport | undefined> {
  const matchPaymentsSavepoint = uuid()
  transaction.savePoint(matchPaymentsSavepoint)
  try {
    const matchPaymentsReport = await matchPayments(
      transaction,
      context.t,
      context.redis,
    )
    transaction.savePointRelease(matchPaymentsSavepoint)
    return matchPaymentsReport
  } catch (e) {
    transaction.transactionRollback({ savePoint: matchPaymentsSavepoint })
    informFailed(
      `importPayments(): match failed with the following error: ${
        e.message || e
      } ${e.stack || ''}`,
    )
  }
}

async function insertNewPayments(transaction: PgDb) {
  const possiblyTarFiles = await getPostfinanceImports(transaction)

  await markImportedFilesAsDone(
    transaction,
    possiblyTarFiles.map(({ fileName }) => fileName),
  )

  const files = await extractTarFiles(possiblyTarFiles)
  const paymentsImported = await insertPayments({ files, transaction })
  return {
    paymentsImported,
    filesImported: files.length,
  }
}

async function markImportedFilesAsDone(transaction: PgDb, fileNames: string[]) {
  if (fileNames.length === 0) return
  await postfinanceImportsTable(transaction).update(
    {
      fileName: fileNames,
    },
    { isImported: true, importedAt: new Date() },
  )
}

async function extractTarFiles(possiblyTarFiles: PostfinanceImportsRecord[]) {
  const postfinanceImportPromises = possiblyTarFiles.map((record) => {
    const { fileName, buffer } = record
    if (fileName.endsWith('.xml')) {
      return [record]
    } else if (fileName.endsWith('.tar.gz')) {
      return extractTarBuffer(buffer)
    }
    return []
  })

  return (await Promise.all(postfinanceImportPromises)).flat()
}

async function informFailed(message: string) {
  console.log(message)
  await publishScheduler(message)
}

interface PostfinanceImportsRecord {
  fileName: string
  buffer: Buffer
  isImported?: boolean
}

function postfinanceImportsTable(transaction: PgDb) {
  return transaction.public.postfinanceImports as PgTable<
    PostfinanceImportsRecord
  >
}

interface InsertPaymentsArguments {
  files: SftpFile[]
  transaction: PgDb
}

type BankAccountId = Nominal<string, 'bankAccountId'>
type IbanToBankAccountMap = Map<IbanCreditor, BankAccountId>

async function getIbanToIdMap(t: PgDb) {
  const table: PgTable<{ id: BankAccountId; iban: IbanCreditor }> =
    t.public.bankAccounts

  const map: IbanToBankAccountMap = new Map()
  const allAccounts = await table.findAll()
  allAccounts.forEach(({ id, iban }) => map.set(iban, id))
  return map
}

const insertPayments = async ({
  files,
  transaction,
}: InsertPaymentsArguments): Promise<number> => {
  if (!files.length) return 0
  const records = getPostfinancePaymentRecords(
    files,
    await getIbanToIdMap(transaction),
  )

  const postfinancePaymentsTable = transaction.public
    .postfinancePayments as PgTable<PostfinancePaymentRecord>

  const insertPromises = records.map(async (record) => {
    if (await exists(record, postfinancePaymentsTable)) return 0
    return await postfinancePaymentsTable.insert(record)
  })

  return (await Promise.all(insertPromises)).reduce((a, b) => a + b)
}

interface PostfinancePaymentRecord {
  buchungsdatum: Date
  valuta: Date
  avisierungstext: string
  gutschrift: number
  mitteilung: string | null
  bankAccountId: BankAccountId
  debitorName: string | null
  image: Buffer | null
}

async function exists(
  record: PostfinancePaymentRecord,
  postfinancePaymentsTable: PgTable<PostfinancePaymentRecord>,
) {
  // after the initial automatic import, exists should be replaced as follows:
  //
  // async function exists(
  //   record: PostfinancePaymentRecord,
  //   postfinancePaymentsTable: PgTable<PostfinancePaymentRecord>,
  // ) {
  //   const { buchungsdatum, valuta, avisierungstext, gutschrift } = record

  //   return !!(await postfinancePaymentsTable.count({
  //     buchungsdatum,
  //     valuta,
  //     avisierungstext,
  //     gutschrift,
  //   }))
  // }
  //
  // As of now, we need to take care of two legacy problems:
  //
  // 1. some previously imported CSV were encoded in `latin-1` but loaded into memory as `utf-8`
  // 2. avisierungstext was not timmed before being written

  const { buchungsdatum, valuta, avisierungstext, gutschrift } = record

  const avisierungstextLatin = Buffer.from(avisierungstext, 'latin1').toString(
    'utf-8',
  )

  return !!(await postfinancePaymentsTable.queryOneField(
    `
      select count(*) from "postfinancePayments"
      where buchungsdatum = :buchungsdatum
      and valuta = :valuta
      and gutschrift = :gutschrift
      and (
        trim(avisierungstext) = :avisierungstext
        or trim(avisierungstext) = :avisierungstextLatin
      )
    `,
    {
      buchungsdatum,
      valuta,
      avisierungstext,
      gutschrift,
      avisierungstextLatin,
    },
  ))
}

type ImageDictionary = Dictionary<{
  reference: string
  png: Buffer
}>

function getPostfinancePaymentRecords(
  files: SftpFile[],
  ibanToBankAccountId: IbanToBankAccountMap,
): PostfinancePaymentRecord[] {
  const xmlFiles = files.filter(({ fileName }) => fileName.match(/\.xml/))
  const images = keyBy(getImageFiles(files), 'reference')

  return xmlFiles.reduce((records: PostfinancePaymentRecord[], file) => {
    records.push(...getRecordsFromFile(file, images, ibanToBankAccountId))
    return records
  }, [])
}

function getRecordsFromFile(
  file: SftpFile,
  images: ImageDictionary,
  ibanToBankAccountId: IbanToBankAccountMap,
) {
  try {
    return parseCamt053(file.buffer.toString('utf-8'))
      .filter(
        ({ isDebitCardPayment, isPayPal, isStripe }) =>
          !(isDebitCardPayment || isPayPal || isStripe),
      )
      .map(extendWithImageAndAccountId(images, ibanToBankAccountId))
  } catch (e) {
    throw new WrappingError(
      e,
      `Error when getting records from file ${file.fileName}`,
    )
  }
}

class WrappingError extends Error {
  constructor(err: Error, message: string) {
    super(`${message}: ${err.message}`)
    this.stack = err.stack
  }
}

const extendWithImageAndAccountId = (
  images: ImageDictionary,
  ibanToBankAccountId: IbanToBankAccountMap,
) => ({
  imageReference,
  iban,
  buchungsdatum,
  valuta,
  avisierungstext,
  gutschrift,
  mitteilung,
  debitorName,
}: PaymentEntry): PostfinancePaymentRecord => {
  let image = null
  if (imageReference) {
    image = images[imageReference].png
    if (!image) {
      throw new Error(
        `Import failed: image with reference ${imageReference} missing.`,
      )
    }
  }

  const bankAccountId = ibanToBankAccountId.get(iban)

  if (!bankAccountId) {
    throw new Error(
      `Import failed: could not find bank account for IBAN ${iban}.`,
    )
  }

  return {
    buchungsdatum,
    valuta,
    avisierungstext,
    gutschrift,
    mitteilung,
    debitorName,
    image,
    bankAccountId,
  }
}

function getImageFiles(files: SftpFile[]) {
  return files
    .filter(({ fileName }) => fileName.match(/\.tiff$/))
    .map(({ buffer, fileName }) => {
      const match = fileName.match(/-([^-]*)\.tiff$/)
      if (!match) {
        throw new Error(
          `Could not match reference number from the following file name: ${fileName}`,
        )
      }
      const reference = match[1]
      return {
        reference,
        png: buffer,
      }
    })
}

async function getPostfinanceImports(transaction: PgDb) {
  const files = await postfinanceImportsTable(transaction).find({
    isImported: false,
  })
  return files
}

function bufferToStream(buffer: Buffer): NodeJS.ReadableStream {
  const stream = new PassThrough()
  stream.end(buffer)
  return stream
}

function extractTarBuffer(buffer: Buffer) {
  const extractReadStream = new tar.Parse() as ParseStream
  const promises: Promise<SftpFile>[] = []

  bufferToStream(buffer).pipe(extractReadStream)
  extractReadStream.on('entry', (e) => {
    const fileName = e.path
    let stream = e
    if (e.path.match(/\.tiff$/)) {
      stream = e.pipe(sharp().png())
    }
    promises.push(toFileBuffer(fileName, stream))
  })

  return new Promise<SftpFile[]>((res, rej) => {
    extractReadStream
      .on('end', () => {
        res(Promise.all(promises))
      })
      .on('error', rej)
  })
}

async function toFileBuffer(
  fileName: string,
  stream: NodeJS.ReadableStream,
): Promise<SftpFile> {
  const buffer = await streamToBuffer(stream)
  return {
    buffer,
    fileName,
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream) {
  const parts = await toArray(stream)
  const buffers = parts.map((part) =>
    Buffer.isBuffer(part) ? part : Buffer.from(part),
  )
  return Buffer.concat(buffers)
}
