const { Roles } = require('@orbiting/backend-modules-auth')

const {
  isEligible,
  userHasSubmitted,
  userSubmitDate,
  userSubmissionId,
  getQuestions,
} = require('../../lib/Questionnaire')

const { getSubmissionById, getConnection } = require('../../lib/Submission')

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
  async userSubmissionId(entity, args, context) {
    const { user: me } = context
    return userSubmissionId(entity.id, me && me.id, context)
  },
  allowedRoles(entity) {
    const roles = entity?.allowedRoles?.filter((role) =>
      Roles.exposableRoles.includes(role),
    )

    return roles?.length ? roles : null
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
  async submissions(questionnaire, args, context) {
    const { submissionsAccessRole, id: questionnaireId } = questionnaire
    const { user: me } = context

    if (
      submissionsAccessRole !== 'NONE' &&
      (submissionsAccessRole === 'PUBLIC' ||
        Roles.userHasRole(me, submissionsAccessRole.toLowerCase()))
    ) {
      const isMember = Roles.userIsInRoles(me, ['member'])

      const connection = await getSubmissionById(
        { questionnaireId, isMember },
        args,
        context,
      )
      if (connection) {
        return connection
      }

      return getConnection({ questionnaireId, isMember }, args, context)
    }

    return null
  },
}
