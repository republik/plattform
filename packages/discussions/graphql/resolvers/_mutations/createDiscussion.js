const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, { pgdb, user, t }) => {
  Roles.ensureUserIsInRoles(user, ['editor', 'admin'])

  const { title, maxLength, minInterval, anonymity, tags, tagRequired } = args

  if (tagRequired && (!tags || tags.length === 0)) {
    throw new Error(t('api/discussion/tagRequiredButNoTags'))
  }

  const { id } = await pgdb.public.discussions.insertAndGet(
    {
      title,
      maxLength,
      minInterval,
      anonymity,
      tags,
      tagRequired: !!tagRequired,
    },
    {
      skipUndefined: true,
    },
  )

  return id
}
