module.exports = async (_, args, context) => {
  try {
    // Fetch pre-populated data
    const count = await context.pgdb.queryOneField(
      `select active + overdue as "count" from cockpit_membership_evolution WHERE key = to_char(CURRENT_DATE, 'YYYY-MM');`,
    )
    return count
  } catch (e) {
    console.error(e)
    throw new Error(context.t('api/unexpected'))
  }
}
