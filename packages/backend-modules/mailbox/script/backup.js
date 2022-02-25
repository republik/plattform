const { ImapFlow } = require('imapflow')
const simpleParser = require('mailparser').simpleParser
const Promise = require('bluebird')
const fse = require('fs-extra')
const crypto = require('crypto')

const config = {
  host: 'imap.mail.hostpoint.ch',
  port: 993,
  secure: true,
  logger: false,
  auth: {
    user: 'user',
    pass: 'some-password',
    data: './local/mailbox',
    search: {
      since: '2018-09-01',
      before: '2019-09-01',
    },
  },
}

BigInt.prototype.toJSON = function () {
  return this.toString()
}

const base64u = (string) =>
  Buffer.from(string)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

const imap = new ImapFlow(config)
const run = async () => {
  // Wait until client connects and authorizes
  await imap.connect()

  // Select and lock a mailbox. Throws if mailbox does not exist
  const mailboxes = await imap.list()

  // fetch latest message source
  const stats = { messages: 0, processed: 0, ignored: 0, existed: 0 }
  const statsInterval = setInterval(() => {
    console.log(stats)
  }, 1000 * 10)

  await Promise.each(mailboxes, async (mailbox) => {
    const { specialUse, path } = mailbox

    const imapLock = await imap.getMailboxLock(path)
    try {
      const status = await imap.status(path, {
        messages: true,
        highestModseq: true,
      })
      stats.messages += status.messages

      const mailboxIdentifier = crypto
        .createHmac('sha256', config.auth.pass)
        .update(path)
        .digest('hex')
      const mailboxDir = `${config.auth.data}/${mailboxIdentifier}`
      await fse.ensureDir(mailboxDir)

      const mailboxPath = `${mailboxDir}/mailbox.json`
      await fse.ensureFile(mailboxPath)
      const mailbox = await fse.readJson(mailboxPath, { throws: false })

      const highestModseq =
        mailbox?.status?.highestModseq && BigInt(mailbox.status.highestModseq)

      if (['\\Junk', '\\Drafts', '\\Trash'].includes(specialUse)) {
        console.log('ignore: %O', {
          path,
          messages: status.messages,
          specialUse,
        })
        stats.ignored += status.messages
        imapLock.release()
        return
      }

      if (path.startsWith("\\Trash'")) {
        console.log('ignore: %O', {
          path,
          messages: status.messages,
        })
        stats.ignored += status.messages
        imapLock.release()
        return
      }

      console.log(
        '%O',
        { path, messages: status.messages },
        { changedSince: highestModseq, now: status.highestModseq.toString() },
      )

      const range = config.auth.search
      const fetchQueryOptions = { source: true }
      const options = false // highestModseq && { changedSince: highestModseq }
      // for await (const rawMessage of imap.fetch('1:*', fetchQueryOptions, options)) {
      for await (const rawMessage of imap.fetch(
        range,
        fetchQueryOptions,
        options,
      )) {
        const { modseq, source } = rawMessage

        await simpleParser(source).then(async (message) => {
          const { attachments, headers, textAsHtml, ...storables } = message
          const { messageId, date } = message

          const bareIdentifier = [
            path,
            messageId,
            !messageId && date?.toISOString(),
            !messageId && !date && modseq.toString(),
          ]
            .filter(Boolean)
            .join('/')

          console.log(date, storables.subject)

          const messageIdentifier = crypto
            .createHmac('sha256', config.auth.pass)
            .update(bareIdentifier)
            .digest('hex')
          const messageDir = `${mailboxDir}/${messageIdentifier}`
          await fse.ensureDir(messageDir)

          const messagePath = `${messageDir}/message.json`

          const hasMessage = await fse.pathExists(messagePath)
          if (hasMessage) {
            stats.existed++
            return
          }

          await fse.writeJSON(messagePath, {
            id: messageIdentifier,
            path,
            ...storables,
          })

          await Promise.map(attachments, async (attachment) => {
            const {
              contentType,
              contentDisposition,
              content,
              filename = contentDisposition?.match(/filename\=\"(.+)\"/)?.[1],
              contentId,
            } = attachment

            if (['text/enriched'].includes(contentType)) {
              return
            }

            if (!filename && !contentId) {
              return
            }

            const filePath = `${messageDir}/${
              filename || `cid-${base64u(contentId)}`
            }`
            await fse.outputFile(filePath, content)
          })

          stats.processed++
        })
      }

      await fse.writeJSON(mailboxPath, {
        ...mailbox,
        id: mailboxIdentifier,
        status,
      })
    } finally {
      imapLock.release()
    }
  })

  console.log('mailboxes: %d', mailboxes.length)
  console.log('messages: %d', stats.messages)

  clearInterval(statsInterval)

  // log out and close connection
  await imap.logout()
}

run().catch((err) => console.error(err))
