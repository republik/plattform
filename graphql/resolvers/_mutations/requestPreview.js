const { ensureSignedIn } = require('@orbiting/backend-modules-auth')
const { graphql: { resolvers: { queries: { document: getDocument } } } } = require('@orbiting/backend-modules-documents')
const { graphql: { resolvers: { Document: DocResolver } } } = require('@orbiting/backend-modules-documents')
const { lib: { html: { get: getHTML } } } = require('@orbiting/backend-modules-documents')
const { descending } = require('d3-array')
const moment = require('moment')

const {
  DEFAULT_MAIL_FROM_ADDRESS,
  PREVIEW_MAIL_REPO_ID,
  FRONTEND_BASE_URL
} = process.env

const minIntervalHours = 12

module.exports = async (_, args, context) => {
  const { user: me, req, t, pgdb, mail: { sendMail } } = context
  ensureSignedIn(req)

  const now = moment()
  if (me._raw.previewsSentAt) {
    const latestPreviewSentAt = me._raw.previewsSentAt
      .sort((a, b) => descending(new Date(a), new Date(b)))
      .shift()
    if (moment(latestPreviewSentAt).add(minIntervalHours, 'hours').isAfter(now)) {
      throw new Error(t('api/preview/mail/tooEarly'))
    }
  }

  if (!PREVIEW_MAIL_REPO_ID) {
    throw new Error('api/preview/mail/404')
  }
  const doc = await getDocument(
    null,
    { repoId: PREVIEW_MAIL_REPO_ID },
    context
  )
  if (!doc) {
    throw new Error(t('api/preview/mail/404'))
  }
  // resolve Document
  doc.content = DocResolver.content(doc, { urlPrefix: FRONTEND_BASE_URL }, context)
  doc.meta = DocResolver.meta(doc, { urlPrefix: FRONTEND_BASE_URL }, context)
  const html = getHTML(doc)

  await sendMail({
    to: me.email,
    fromEmail: DEFAULT_MAIL_FROM_ADDRESS,
    subject: t('api/preview/mail/subject'),
    html
  })

  await pgdb.query(`
    UPDATE
      users
    SET
      "previewsSentAt" = COALESCE("previewsSentAt", '[]'::jsonb)::jsonb || :previewSentAt::jsonb
    WHERE
      id = :userId
  `, {
    previewSentAt: JSON.stringify([now]),
    userId: me.id
  })

  return {success: true}
}
