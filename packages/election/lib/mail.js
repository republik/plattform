const debug = require('debug')('election:lib:mail')

const { sendMailTemplate } = require('@orbiting/backend-modules-mail')
const { transformUser } = require('@orbiting/backend-modules-auth')

const { FRONTEND_BASE_URL } = process.env

const sendCandidacyConfirmation = async ({ user, election, pgdb, t }) => {
  debug('sendCandidacyConfirmation')

  const { shortSlug } = election

  return sendMail(
    user.email,
    // either "election_candidacy_confirmation"
    // or "election_candidacy_confirmation_slugsomething"
    ['election_candidacy_confirmation', shortSlug].filter(Boolean).join('_'),
    { user, t }
  )
}

module.exports = {
  // Onboarding
  sendCandidacyConfirmation
}

const sendMail = async (to, templateName, { user, t }) => {
  const mail = await sendMailTemplate({
    to,
    fromEmail: process.env.DEFAULT_MAIL_FROM_ADDRESS,
    subject: t(
      `api/election/email/${templateName}/subject`,
      getTranslationVars(user)
    ),
    templateName,
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
  { name: 'FRONTEND_BASE_URL',
    content: FRONTEND_BASE_URL
  },
  { name: 'LINK_PROJECTR',
    content: 'https://project-r.construction/'
  },
  { name: 'LINK_ETIQUETTE',
    content: `${FRONTEND_BASE_URL}/etikette`
  }
])
