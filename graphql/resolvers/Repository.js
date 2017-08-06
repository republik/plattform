module.exports = {
  uncommitedChanges: async ({owner, name}, {path}, {redis, pgdb}) => {
    const key = `${owner}/${name}/${path}`
    const userIds = await redis.zrangeAsync(key, 0, -1)
    if (!userIds.length) {
      return []
    }
    return pgdb.public.users.find({id: userIds})
  }
}
