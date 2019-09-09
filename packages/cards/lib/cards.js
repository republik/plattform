const hasCards = async (user, pgdb) => {
  return !!(await pgdb.public.cards.count({ userId: user.id }))
}

module.exports = {
  hasCards
}
