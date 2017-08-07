module.exports = {
  uncommittedChanges: async ({owner: login, name: repository}, {path}, {redis, pgdb}) => {
    const key = `${login}/${repository}/${path}`
    const userIds = await redis.zrangeAsync(key, 0, -1)
    if (!userIds.length) {
      return []
    }
    return pgdb.public.users.find({id: userIds})
  }
}
