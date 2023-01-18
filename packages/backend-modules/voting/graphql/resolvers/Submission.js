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
  displayAuthor: async (submission, args, context) => {
    const { userId, questionnaireId } = submission
    const { loaders, t } = context

    const id = crypto
      .createHmac('sha256', DISPLAY_AUTHOR_SECRET)
      .update(`${questionnaireId}${userId}`)
      .digest('hex')

    if (!userId) {
      return {
        id: 'hidden',
        name: t('api/comment/hidden/displayName'),
        profilePicture: null,
        anonymity: true,
        username: null,
      }
    }

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
  answers: async (submission, args, { loaders }) => {
    const { questionnaireId, userId, pseudonym, _matchedAnswerIds } = submission

    if (!userId && !pseudonym) {
      return {
        nodes: [],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
        },
        totalCount: 0,
      }
    }

    const answers = await loaders.Answer.byKeyObj.load({
      questionnaireId,
      ...(userId && { userId }),
      ...(pseudonym && { pseudonym }),
    })

    const nodes = answers
      .filter(({ _question }) => !_question?.private)
      .filter(({ payload }) => !!payload)
      .map((answer) => ({
        ...answer,
        hasMatched: _matchedAnswerIds?.includes(answer.id),
      }))

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
