module.exports = async (user, pgdb) => {
  return !!(await pgdb.public.memberships.count({ userId: user.id, active: true }))
}
