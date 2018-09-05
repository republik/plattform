const debug = require('debug')('preview:lib:mail')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { transformUser } = require('@orbiting/backend-modules-auth')

const { FRONTEND_BASE_URL } = process.env

const sendOnboarding = async ({ user, request, pgdb, t }) => {
  debug('sendPreviewOnboarding')

  await pgdb.public.previewEvents.insert({
    previewRequestId: request.id,
    event: 'email.onboarding'
  })

  return sendMail(user.email, 'onboarding', { user, t })
}

module.exports = {
  // Onboarding
  sendOnboarding
}

const sendMail = async (to, template, { user, t }) => {
  const mail = await sendMailTemplate({
    to,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t(
      `api/preview/email/${template}/subject`,
      getTranslationVars(user)
    ),
    templateName: `preview_${template}`,
    globalMergeVars: getGlobalMergeVars()
  })

  return mail
}

const getTranslationVars = (user) => {
  const safeUser = transformUser(user)

  return {
    nameOrEmail: safeUser.name || safeUser.email
  }
}

const getGlobalMergeVars = () => ([
  // Links
  { name: 'LINK_FAQ',
    content: `${FRONTEND_BASE_URL}/faq`
  },
  { name: 'LINK_MANIFEST',
    content: `${FRONTEND_BASE_URL}/manifest`
  },
  { name: 'LINK_IMPRINT',
    content: `${FRONTEND_BASE_URL}/impressum`
  },
  { name: 'LINK_PROJECTR',
    content: 'https://project-r.construction/'
  }
])
