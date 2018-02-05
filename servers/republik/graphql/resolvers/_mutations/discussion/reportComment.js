const { Roles } = require('@orbiting/backend-modules-auth')

module.exports = async (_, args, {pgdb, user}) => {
  Roles.ensureUserHasRole(user, 'member')

  const {
    id
  } = args

  await pgdb.query(`
    UPDATE
      comments
    SET
      "reportedBy" = COALESCE("reportedBy", '[]'::jsonb)::jsonb || :reporter::jsonb
    WHERE
      id = :commentId AND
      ("reportedBy" IS NULL OR NOT "reportedBy" @> :reporter)
  `, {
    commentId: id,
    reporter: JSON.stringify([user.id])
  })

  return true
}
