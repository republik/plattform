module.exports = (_, args, { pgdb }) => ({
  count: async () => {
    const { PARKING_USER_ID } = process.env
    return pgdb.public.memberships.count({
      'userId !=': PARKING_USER_ID,
      active: true
    })
  }
})
