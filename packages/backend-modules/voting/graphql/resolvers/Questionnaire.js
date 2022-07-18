const { Roles } = require('@orbiting/backend-modules-auth')

const {
  isEligible,
  userHasSubmitted,
  userSubmitDate,
  getQuestions,
} = require('../../lib/Questionnaire')

const { getConnection } = require('../../lib/Submission')

module.exports = {
  async userIsEligible(entity, args, { pgdb, user: me }) {
    return isEligible(me && me.id, entity, pgdb)
  },
  async userHasSubmitted(entity, args, context) {
    const { user: me } = context
    return userHasSubmitted(entity.id, me && me.id, context)
  },
  async userSubmitDate(entity, args, context) {
    const { user: me } = context
    return userSubmitDate(entity.id, me && me.id, context)
  },
  async questions(entity, args, { pgdb, user: me }) {
    return getQuestions(entity, args, pgdb)
  },
  async turnout(questionnaire, args, { pgdb }) {
    if (questionnaire.result && questionnaire.result.turnout) {
      // after counting
      return questionnaire.result.turnout
    }
    return { entity: questionnaire }
  },
  submissions(questionnaire, args, { user: me, elastic }) {
    const { submissionsAccessRole, id: questionnaireId } = questionnaire

    if (
      submissionsAccessRole !== 'NONE' &&
      (submissionsAccessRole === 'PUBLIC' ||
        Roles.userHasRole(me, submissionsAccessRole.toLowerCase()))
    ) {
      return getConnection({ questionnaireId }, args, { elastic })
    }

    return null
  },
}
