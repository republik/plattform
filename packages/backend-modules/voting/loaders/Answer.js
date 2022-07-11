const createDataLoader = require('@orbiting/backend-modules-dataloader')

module.exports = (context) => ({
  byKeyObj: createDataLoader(
    (keyObjs) =>
      context.pgdb.public.answers.find(
        {
          or: keyObjs.map((keyObj) => ({
            and: keyObj,
          })),
        },
        {
          fields:
            '*, (SELECT "order" FROM questions WHERE questions.id = "questionId") "questionOrder"',
          orderBy: ['questionOrder', 'createdAt'],
        },
      ),
    { many: true },
  ),
})
