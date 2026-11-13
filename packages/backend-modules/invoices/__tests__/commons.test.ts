import {
  getSwissQrBillData,
  splitStreet,
  PaymentResolved,
} from '../lib/commons'

describe('splitStreet', () => {
  it.each([
    ['Hauptstrasse 12', 'Hauptstrasse', '12'],
    ['Hauptstrasse 12a', 'Hauptstrasse', '12a'],
    ['Rue de Lausanne 5bis', 'Rue de Lausanne', '5bis'],
    ['Bahnhofstrasse 12-14', 'Bahnhofstrasse', '12-14'],
    ['Bahnhofstrasse 12 - 14', 'Bahnhofstrasse', '12 - 14'],
    ['Hauptstrasse, 12', 'Hauptstrasse', '12'],
    ['  Hauptstrasse   12  ', 'Hauptstrasse', '12'],
    ['Postfach 123', 'Postfach', '123'],
  ])('splits %j', (line1, address, buildingNumber) => {
    expect(splitStreet(line1)).toEqual({ address, buildingNumber })
  })

  it.each(['Hauptstrasse', '12', '12 Main Street'])(
    'keeps %j as street with an empty (not undefined) building number',
    (line1) => {
      expect(splitStreet(line1)).toEqual({
        address: line1,
        buildingNumber: '',
      })
    },
  )
})

describe('country resolution (via getSwissQrBillData)', () => {
  const base = {
    id: 'a',
    name: 'Anna Muster',
    line1: 'Hauptstrasse 1',
    postalCode: '8000',
    city: 'Ort',
  }

  const codeFor = (country: string | undefined) =>
    getSwissQrBillData({
      id: 'p',
      hrid: 'ABC123',
      total: 100,
      pledge: {
        package: {
          bankAccount: { iban: 'CH4431999123000889012', address: base },
        },
        user: { address: { ...base, country } },
      },
    } as unknown as PaymentResolved).debtor?.country

  it.each([
    ['Schweiz', 'CH'],
    ['schweiz ', 'CH'],
    ['SCHWEIZ', 'CH'],
    ['CH', 'CH'],
    ['ch', 'CH'],
    ['Switzerland', 'CH'],
    ['Suisse', 'CH'],
    ['sweden', 'SE'],
    ['Schweden', 'SE'],
    ['Deutschland', 'DE'],
    ['Germany', 'DE'],
    ['BRD', 'DE'],
    ['Österreich', 'AT'],
    ['Belgien', 'BE'],
    ['Vereinigte Staaten', 'US'],
    ['USA', 'US'],
    ['Liechtenstein', 'LI'],
    ['', 'CH'],
    [undefined, 'CH'],
  ])('resolves %j to %s', (country, code) => {
    expect(codeFor(country)).toBe(code)
  })
})

describe('getSwissQrBillData', () => {
  const address = {
    id: 'a',
    name: 'Republik AG',
    line1: 'Sihlhallenstrasse 1',
    postalCode: '8004',
    city: 'Zürich',
    country: 'Schweiz',
  }

  const payment = {
    id: 'p',
    hrid: 'ABC123',
    total: 24000,
    pledge: {
      package: { bankAccount: { iban: 'CH4431999123000889012', address } },
      user: {
        address: {
          ...address,
          organization: 'Muster GmbH',
          name: 'Anna Muster',
          line1: 'Rue de Lausanne 5bis',
          country: 'Frankreich',
        },
      },
    },
  } as unknown as PaymentResolved

  it('uses structured addresses for creditor and debtor', () => {
    const data = getSwissQrBillData(payment)

    expect(data.creditor).toMatchObject({
      address: 'Sihlhallenstrasse',
      buildingNumber: '1',
      country: 'CH',
    })
    expect(data.debtor).toMatchObject({
      name: 'Muster GmbH, Anna Muster',
      address: 'Rue de Lausanne',
      buildingNumber: '5bis',
      country: 'FR',
    })
  })

  it('throws for an unknown country instead of defaulting to CH', () => {
    const unknown = {
      ...payment,
      pledge: {
        ...payment.pledge,
        user: { address: { ...address, country: 'Atlantis' } },
      },
    } as unknown as PaymentResolved

    expect(() => getSwissQrBillData(unknown)).toThrow('Unknown country')
  })
})
