const crypto = require('crypto')

const {
  portrait: getPortrait,
  name: getName,
  slug: getSlug,
  credentials: getCredentials,
} = require('@orbiting/backend-modules-republik/graphql/resolvers/User')

const { findById } = require('../../lib/Questionnaire')

const { DISPLAY_AUTHOR_SECRET } = process.env

module.exports = {
  questionnaire: async (submission, args, { pgdb }) => {
    return findById(submission.questionnaireId, pgdb)
  },
  user: async (submission, args, { loaders }) => {
    return loaders.User.byId.load(submission.userId)
  },
  displayAuthor: async (submission, args, context) => {
    const { userId, questionnaireId } = submission
    const { loaders, t } = context

    const id = crypto
      .createHmac('sha256', DISPLAY_AUTHOR_SECRET)
      .update(`${questionnaireId}${userId}`)
      .digest('hex')

    const submitter = await loaders.User.byId.load(userId)

    const name = getName(submitter, null, context)
    const profilePicture = getPortrait(submitter, args?.portrait, context)
    const credentials = await getCredentials(submitter, null, context)
    const slug = getSlug(submitter, null, context)

    return {
      id,
      name: name || t('api/noname'),
      profilePicture: profilePicture,
      credential: credentials?.find((c) => !!c.isListed),
      anonymity: false,
      username: slug,
      slug,
    }
  },
  answers: async (submission, args, { loaders, pgdb }) => {
    const { questionnaireId, userId } = submission

    const answers = await loaders.Answer.byKeyObj.load({
      questionnaireId,
      userId,
    })

    const nodes = answers
      .filter(({ payload }) => !!payload)
      .filter(({ _question }) => !_question?.private)

    return {
      nodes,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
      totalCount: nodes?.length || 0,
    }
  },
}
