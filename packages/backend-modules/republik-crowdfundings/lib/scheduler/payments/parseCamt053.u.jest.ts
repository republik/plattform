import path from 'path'
import fs from 'fs/promises'

import { parseCamt053, PaymentEntry } from './parseCamt053'
import { types } from 'util'
const { isDate } = types

async function loadFixture(name: string) {
  return (
    await fs.readFile(path.join(__dirname, `fixtures/camt053${name}.xml`))
  ).toString()
}

describe('parseCamt053():', () => {
  it('returns an empty array when there are not credit entries', async () => {
    const xmlString = await loadFixture('oneDebit')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries.length).toEqual(0)
  })

  it('works with a single entry', async () => {
    const xmlString = await loadFixture('singleEntry')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries.length).toEqual(1)
    const paymentEntry = paymentEntries[0]
    assertEntryValues(paymentEntry)
    assertAllEntryBoolsFalse(paymentEntry)
    expect(paymentEntry.avisierungstext).toEqual('Hello World')
  })

  it('works with multiple entries', async () => {
    const xmlString = await loadFixture('threeEntries')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries.length).toEqual(3)
  })

  it('works with no entries', async () => {
    const xmlString = await loadFixture('noEntries')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries.length).toEqual(0)
  })

  it('retruns the amount in cents', async () => {
    const xmlString = await loadFixture('singleEntry')
    const [{ gutschrift }] = parseCamt053(xmlString)
    expect(gutschrift).toBe(24000)
  })

  it('recognizes creditor reference', async () => {
    const xmlString = await loadFixture('reference')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries[0].mitteilung).toEqual('AAAAAA')
    expect(paymentEntries[1].mitteilung).toEqual('BBBBBB')
    expect(paymentEntries[2].mitteilung).toEqual('CCCCCC')
    expect(paymentEntries[3].mitteilung).toEqual('EEEEEE')
    expect(paymentEntries[4].mitteilung).toEqual('FFFFFF')
  })

  it('falls back to remittance information for `Mitteilung`', async () => {
    const xmlString = await loadFixture('mitteilung')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries[0].mitteilung).toEqual('BBBBBB')
    expect(paymentEntries[1].mitteilung).toEqual('AAAAAA')
    expect(paymentEntries[2].mitteilung).toEqual('AAAAAA')
    expect(paymentEntries[3].mitteilung).toEqual('CCCCCC')
    expect(paymentEntries[4].mitteilung).toEqual(null)
    expect(paymentEntries[5].mitteilung).toEqual('EEEEEE')
    expect(paymentEntries[6].mitteilung).toEqual('FFFFFF')
    expect(paymentEntries[7].mitteilung).toEqual('GGGGGG')
  })

  it('returns the reference for the sanned cash deposit', async () => {
    const xmlString = await loadFixture('overTheCounterCashDeposit')
    const paymentEntry = parseCamt053(xmlString)[0]
    expect(paymentEntry.imageReference).toEqual('INSTR-ID')
  })

  it('recognizes debit card payments', async () => {
    const xmlString = await loadFixture('debitCard')
    const paymentEntry = parseCamt053(xmlString)?.[0]
    expect(paymentEntry.isDebitCardPayment).toBe(true)
  })
  it('recognizes PayPal payments', async () => {
    const xmlString = await loadFixture('paypal')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries[0].isPayPal).toBe(true)
    expect(paymentEntries[1].isPayPal).toBe(true)
    expect(paymentEntries[2].isPayPal).toBe(true)
  })

  it('recognizes Stripe payments', async () => {
    const xmlString = await loadFixture('stripe')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries[0].isStripe).toBe(true)
    expect(paymentEntries[1].isStripe).toBe(true)
    expect(paymentEntries[2].isStripe).toBe(true)
  })

  it('recognizes collectiveCredit payments', async () => {
    const xmlString = await loadFixture('collectiveCredit')
    const paymentEntries = parseCamt053(xmlString)
    expect(paymentEntries[0].isCollectiveCredit).toBe(true)
  })
})

function assertEntryValues(e: PaymentEntry) {
  expectString(e.avisierungstext)
  expectDate(e.buchungsdatum)
  expectDate(e.valuta)
  expectString(e.iban)
  expectBoolean(e.isDebitCardPayment)
  expectBoolean(e.isPayPal)
  expectBoolean(e.isStripe)
  expect(e.iban).toMatch(/\w\w\d\d.+/)
  expectNumber(e.gutschrift)
}

function assertAllEntryBoolsFalse(e: PaymentEntry) {
  expect(e.isDebitCardPayment).toBe(false)
  expect(e.isPayPal).toBe(false)
  expect(e.isStripe).toBe(false)
}

function expectBoolean(value: any) {
  return typeof value === 'boolean'
}

function expectNumber(n: number) {
  expect(typeof n).toBe('number')
  expect(isNaN(n)).toBe(false)
}

function expectDate(e: any) {
  expect(isDate(e)).toEqual(true)
  expect(isNaN(e.getTime())).toEqual(false)
}

function expectString(s: string) {
  expect(typeof s).toEqual('string')
  expect(s).not.toEqual('')
}
