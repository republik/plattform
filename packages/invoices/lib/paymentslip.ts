import { PDF, data } from 'swissqrbill'

export async function generate(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const data: data = {
      currency: 'CHF',
      amount: 240,
      message: 'HR-ID: 123123 (via QR)',
      additionalInformation: 'HR-ID: 123123',
      creditor: {
        name: 'Project R Genossenschaft',
        account: 'CH5009000000610117606',
        address: 'Sihlhallenstrasse',
        houseNumber: '1',
        zip: 8004,
        city: 'Zürich',
        country: 'CH',
      },
      debtor: {
        name: 'Firstname Lastname',
        address: 'Address',
        houseNumber: '123',
        zip: 3952,
        city: 'Susten',
        country: 'CH',
      },
    }

    const doc = new PDF(data, '/dev/null')

    const buffers: Buffer[] = []
    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', () => reject())
  })
}
