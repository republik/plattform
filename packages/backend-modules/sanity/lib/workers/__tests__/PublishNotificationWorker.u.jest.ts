const sendNotification = jest.fn().mockResolvedValue({ id: 'event-1' })
const fetchArticleForNotification = jest.fn()
const resolveNotificationRecipients = jest.fn()

jest.mock('@orbiting/backend-modules-subscriptions', () => ({
  sendNotification: (...args: unknown[]) => sendNotification(...args),
}))
jest.mock('@orbiting/backend-modules-job-queue', () => ({
  BaseWorker: class {
    constructor(
      public pgBoss: unknown,
      public logger: unknown,
      public context: unknown,
    ) {}
  },
}))
jest.mock('../../article', () => ({
  fetchArticleForNotification: (...args: unknown[]) =>
    fetchArticleForNotification(...args),
  resolveNotificationRecipients: (...args: unknown[]) =>
    resolveNotificationRecipients(...args),
}))

// The tts index pulls in S3/assets modules that need env vars at import time.
jest.mock('../../../tts', () => ({
  plainText: (blocks?: { children: { text: string }[] }[]) =>
    (blocks ?? []).map((b) => b.children.map((c) => c.text).join('')).join(' '),
}))

import { PublishNotificationWorker } from '../PublishNotificationWorker'
import { toSanityRef } from '../../document'

const block = (text: string) => [
  {
    _type: 'block',
    children: [{ _type: 'span', text, marks: [] }],
    markDefs: [],
    style: 'normal',
  },
]

const t = (key: string, vars: Record<string, string> = {}) =>
  `${key}|${Object.values(vars).join('|')}`

const run = async (article: Record<string, unknown>) => {
  fetchArticleForNotification.mockResolvedValue({
    _id: 'article-1',
    title: block('Der Titel'),
    articleCollections: [{ collection: { _id: 'c1', title: 'Sammlung' } }],
    ...article,
  })
  resolveNotificationRecipients.mockResolvedValue({
    collectionSubscribers: [
      { id: 'u1', __subscription: { objectDocumentId: toSanityRef('c1') } },
    ],
    authorSubscribers: [],
  })
  const worker = new PublishNotificationWorker(
    {} as any,
    {} as any,
    {
      t,
      loaders: {},
    } as any,
  )
  await worker.perform([
    {
      data: {
        $version: 'v1',
        documentId: 'article-1',
        notificationTrigger: 'test',
      },
    } as any,
  ])
  return sendNotification.mock.calls[0][0].content
}

describe('PublishNotificationWorker collection notifications', () => {
  beforeEach(() => {
    sendNotification.mockClear()
  })

  it('titles the push after the Format and puts pushNotificationText in the body', async () => {
    const content = await run({
      format: { title: 'Republik heute', path: '/format/heute' },
      pushNotificationText: block('Der Teaser'),
    })

    expect(content.app.title).toBe(
      'api/notifications/doc/format/title|«Republik heute»',
    )
    expect(content.app.body).toBe('Der Teaser')
  })

  it('uses the article title as body without pushNotificationText', async () => {
    const content = await run({
      format: { title: 'Republik heute', path: '/format/heute' },
    })

    expect(content.app.title).toBe(
      'api/notifications/doc/format/title|«Republik heute»',
    )
    expect(content.app.body).toBe('Der Titel')
  })

  it('falls back to the followed collection title without a heading', async () => {
    const content = await run({ format: null })

    expect(content.app.title).toBe(
      'api/notifications/doc/format/title|«Sammlung»',
    )
  })

  it('falls back to the article title when nothing names a Format', async () => {
    const content = await run({ format: null, articleCollections: [] })

    expect(content.app.title).toBe('Der Titel')
  })

  it('keeps the teaser-first email subject', async () => {
    const content = await run({
      format: { title: 'Republik heute' },
      pushNotificationText: block('Der Teaser'),
    })

    expect(content.mail({ email: 'a@b.ch' }).subject).toBe('Der Teaser')
  })
})
