const { ascending } = require('d3-array')

const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byKeyObj: createDataLoader(
    async (keyObjs, a) => {
      const { pgdb } = context

      const answers = await pgdb.public.answers.find(
        {
          or: keyObjs.map((keyObj) => ({
            and: keyObj,
          })),
        },
        { orderBy: ['createdAt'] },
      )

      if (!answers.length) {
        return []
      }

      const questions = await pgdb.public.questions.find(
        { id: [...new Set(answers.map((answer) => answer.questionId))] },
        { fields: ['id', 'order', 'hidden', 'private'] },
      )

      return answers
        .map((answer) => ({
          ...answer,
          _question: questions.find(
            (question) => question.id === answer.questionId,
          ),
        }))
        .filter(({ _question }) => !_question?.hidden)
        .sort((a, b) => ascending(a._question.order, b._question.order))
    },
    { many: true },
  ),
})
