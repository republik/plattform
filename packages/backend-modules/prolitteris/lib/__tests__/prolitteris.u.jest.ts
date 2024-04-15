import {
  PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH,
  assertValidMessageText,
} from '../proliterris'
import { faker } from '@faker-js/faker'

describe('assertValidMessageText', () => {
  it('throws if both plainText and and pdfOrEpub are Provided in message', () => {
    const t = () => {
      const msgText = {
        pdfOrEpub: faker.lorem.text(),
        plainText: faker.lorem.text(),
      }
      assertValidMessageText(msgText)
    }

    expect(t).toThrow('must be one of plainText or pdfOrEpub')
  })
  it('throws if plainText is not base64 encoded', () => {
    const t = () => {
      const msgText = {
        plainText: faker.lorem.text(),
      }
      assertValidMessageText(msgText)
    }

    expect(t).toThrow('plainText is not valid base64')
  })
  it('does not throw if plainText is valid base64', () => {
    const t = () => {
      const msgText = {
        plainText: Buffer.from(faker.lorem.text()).toString('base64'),
      }
      assertValidMessageText(msgText)
    }

    expect(t).not.toThrow('plainText is not valid base64')
  })
  it('throws if plainText exceeds max length', () => {
    const maxPossibleTextLength =
      PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH * (3 / 4)
    const t = () => {
      const msgText = {
        plainText: Buffer.alloc(maxPossibleTextLength + 1).toString('base64'),
      }
      assertValidMessageText(msgText)
    }

    expect(t).toThrow('plainText exceeds max base64 text length')
    const t2 = () => {
      const msgText = {
        plainText: Buffer.alloc(maxPossibleTextLength).toString('base64'),
      }
      assertValidMessageText(msgText)
    }

    expect(t2).not.toThrow('plainText exceeds max base64 text length')
  })
  it('throws if pdfOrEpub blob is not base64', async () => {
    const pdfBlobText = await new Blob([Buffer.alloc(4000)], {
      type: 'application/pdf',
    }).text()

    const t = () => {
      const msgText = {
        pdfOrEpub: pdfBlobText,
      }
      assertValidMessageText(msgText)
    }

    expect(t).toThrow('pdfOrEpub is not valid base64')
  })
  it('does not throw if pdfOrEpub blob is valid base64', async () => {
    const pdfBlobText = await new Blob([Buffer.alloc(4000)], {
      type: 'application/pdf',
    }).text()

    const t = () => {
      const msgText = {
        pdfOrEpub: Buffer.from(pdfBlobText).toString('base64'),
      }
      assertValidMessageText(msgText)
    }

    expect(t).not.toThrow('pdfOrEpub is not valid base64')
  })
  it('throws if pdfOrEpub exceeds max base64 size', async () => {
    const maxPossibleTextLength =
      PROLITTERIS_MAX_MESSAGE_BASE64_LENGTH * (3 / 4)
    const pdfBlob1 = await new Blob([Buffer.alloc(maxPossibleTextLength + 1)], {
      type: 'application/pdf',
    }).text()

    const t = () => {
      const msgText = {
        pdfOrEpub: Buffer.from(pdfBlob1).toString('base64'),
      }
      assertValidMessageText(msgText)
    }

    expect(t).toThrow('pdfOrEpub exceeds max base64 text length of')

    const pdfBlob2 = await new Blob([Buffer.alloc(maxPossibleTextLength)], {
      type: 'application/pdf',
    }).text()

    const t2 = () => {
      const msgText = {
        pdfOrEpub: Buffer.from(pdfBlob2).toString('base64'),
      }
      assertValidMessageText(msgText)
    }

    expect(t2).not.toThrow('pdfOrEpub exceeds max base64 text length of')
  })
})
