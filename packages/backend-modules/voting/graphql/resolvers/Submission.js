const { findById } = require('../../lib/Questionnaire')

module.exports = {
  questionnaire: async (submission, args, { pgdb }) => {
    return findById(submission.questionnaireId, pgdb)
  },
  user: async (submission, args, { loaders }) => {
    return loaders.User.byId.load(submission.userId)
  },
  displayAuthor: async (submission, args, { t }) => {
    const { id, questionnaireId, userId } = submission

    return {
      id: [id, questionnaireId, userId].filter(Boolean).join('-'),
      name: t('api/comment/anonymous/displayName'),
      profilePicture: null,
      anonymity: true,
      username: null,
    }
  },
  answers: async (submission, args, { pgdb }) => {
    const nodes = await pgdb.public.answers.find(
      { questionnaireId: submission.questionnaireId },
      { limit: 5 },
    )

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
