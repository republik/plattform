const { remark } = require('@orbiting/backend-modules-utils')

const isMine = (memo, me) => me && memo.userId === me.id

module.exports = {
  parentIds: ({ parentIds }) => parentIds || [],
  text: async (memo, args, { user: me }) =>
    isMine(memo, me) ? memo.text : null,
  content: async (memo) =>
    isMine(memo, me) || memo.published ? remark.parse(text) : null,
  author: async (memo, args, context) => {
    if (!isMine(memo, me) && !memo.published) {
      return { // @TODO: Check this
        name: 'anon',
        email: 'anon@republik.ch',
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
