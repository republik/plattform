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
    const { questionnaireId, userId } = submission

    const nodes = await pgdb.public.query(
      `
      SELECT a.*
      FROM answers a
      JOIN questions q
        ON q.id = "questionId"
       AND a."questionnaireId" = :questionnaireId
      WHERE a."userId" = :userId
      ORDER BY q.order
    `,
      { questionnaireId, userId },
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
