const { remark } = require('@orbiting/backend-modules-utils')

const isMine = (memo, me) => me && memo.userId === me.id

module.exports = {
  parentIds: ({ parentIds }) => parentIds || [],
  text: async (memo, args, { user: me }) =>
    isMine(memo, me) ? memo.text : null,
  content: async (memo, args, { user: me }) =>
    isMine(memo, me) || memo.published ? remark.parse(memo.text) : null,
  author: async (memo, args, context) => {
    const { user: me, t } = context
    if (!isMine(memo, me) && !memo.published) {
      return {
        name: t('api/publikator/memo/notPublished/author/name'),
        email: t('api/publikator/memo/notPublished/author/email'),
      }
    }

    const user =
      memo.userId && (await context.loaders.User.byId.load(memo.userId))

    if (user) {
      return {
        name: [user.firstName, user.lastName].join(' ').trim() || user.email,
        email: user.email,
        user,
      }
    }

    return {
      name: memo.author.name,
      email: memo.author.email,
    }
  },
}
