const shuffleSeed = require('shuffle-seed')

const { paginate: { paginator } } = require('@orbiting/backend-modules-utils')

const defaults = {
  first: 10
}

const hasCards = async (user, pgdb) => {
  return !!(await pgdb.public.cards.count({ userId: user.id }))
}

const removeDuplicates = (arrayWithObject, identfier) => {
  const lookup = {}

  return arrayWithObject.filter(object => {
    if (!lookup[object[identfier]]) {
      lookup[object[identfier]] = true
      return true
    }

    return false
  })
}

const weightShuffleCards = (cards, seed, focus = []) => {
  const weightCards = cards

  cards.forEach(card => {
    const { payload } = card
    const { nationalCouncil } = payload

    if (nationalCouncil.electionPlausibility === 'GOOD') {
      weightCards.push(card)
      weightCards.push(card)
      weightCards.push(card)
    }

    if (nationalCouncil.electionPlausibility === 'DECENT') {
      weightCards.push(card)
      weightCards.push(card)
    }

    if (payload.statement) {
      weightCards.push(card)
      weightCards.push(card)
      weightCards.push(card)
    }
  })

  const shuffeledCards = shuffleSeed.shuffle(weightCards, seed)

  focus.reverse().forEach(id => {
    const focusedCard = shuffeledCards.find(card => card.id === id)
    if (focusedCard) {
      shuffeledCards.unshift(focusedCard)
    }
  })

  return removeDuplicates(shuffeledCards, 'id')
}

const paginateCards = (args, cards) => {
  return paginator(
    Object.assign({}, defaults, args),
    ({ after, before }) => ({
      seed:
        (after && after.payload && after.payload.seed) ||
        (before && before.payload && before.payload.seed) ||
        Math.round(Math.random() * 100000)
    }),
    (args, payload) => weightShuffleCards(cards, payload.seed, args.focus)
  )
}

module.exports = {
  hasCards,
  weightShuffleCards,
  paginateCards
}
