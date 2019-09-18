const shuffleSeed = require('shuffle-seed')

const { paginate: { paginator } } = require('@orbiting/backend-modules-utils')
const { Subscriptions } = require('@orbiting/backend-modules-subscriptions')

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

const filterCards = async (cards, { filters = {} }, context) => {
  let filteredCards = [ ...cards ]

  // { parties: [ <party 1>, ...<party n> ]}
  if (filters.parties) {
    filteredCards = filteredCards.filter(card => (
      card.payload &&
      card.payload.party &&
      filters.parties.includes(card.payload.party)
    ))
  }

  // { partyGroups: [ <partyGroup 1>, ...<partyGroup n> ]}
  if (filters.partyGroups) {
    filteredCards = filteredCards.filter(card => (
      card.payload &&
      card.payload.party &&
      filters.partyGroups.includes(card.payload.partyGroup)
    ))
  }

  // { subscribedByMe: <Boolean> }
  if (filters.subscribedByMe) {
    if (context.user) {
      const subscriptions = await Subscriptions.getSubscriptionsByUserForObjects(
        context.user.id,
        'User',
        filteredCards.map(card => card.userId),
        'COMMENTS',
        context
      )

      const subscribedUserIds = subscriptions.map(subscription => subscription.objectUserId)

      filteredCards = filteredCards.filter(card => subscribedUserIds.includes(card.userId))
    } else {
      filteredCards = []
    }
  }

  return filteredCards
}

const paginateCards = async (cards, args, context) => {
  const filteredCards = await filterCards(cards, args, context)

  return paginator(
    Object.assign({}, defaults, args),
    ({ after, before }) => ({
      seed:
        (after && after.payload && after.payload.seed) ||
        (before && before.payload && before.payload.seed) ||
        Math.round(Math.random() * 100000)
    }),
    (args, payload) => weightShuffleCards(filteredCards, payload.seed, args.focus)
  )
}

const upsertStatement = async (_card, transaction) => {
  const card = await transaction.public.cards.findOne({ id: _card.id })
  const cardGroup = await transaction.public.cardGroups.findOne({ id: card.cardGroupId })
  const discussion = await transaction.public.discussions.findOne({ id: cardGroup.discussionId })
  const now = new Date()

  if (discussion) {
    const credentials = await transaction.public.credentials.find(
      { userId: card.userId, isListed: true }
    )

    const discussionPreference = await transaction.public.discussionPreferences.findOne(
      { discussionId: discussion.id, userId: card.userId }
    )

    if (!discussionPreference) {
      await transaction.public.discussionPreferences.insert({
        discussionId: discussion.id,
        userId: card.userId,
        credentialId: credentials
          .find(credential => credential.userId === card.userId)
          .id,
        notificationOption: 'MY_CHILDREN',
        anonymous: false
      })
    }

    if (!card.commentId) {
      const { hotness } = require('@orbiting/backend-modules-discussions')
      const comment = await transaction.public.comments.insertAndGet({
        discussionId: cardGroup.discussionId,
        userId: card.userId,
        content: card.payload.statement.trim(),
        hotness: hotness(0, 0, (new Date().getTime())),
        createdAt: now,
        updatedAt: now
      })

      await transaction.public.cards.update(
        { id: card.id },
        {
          commentId: comment.id,
          updatedAt: now
        }
      )

      return 'insert'
    }

    await transaction.public.comments.updateAndGetOne(
      { id: card.commentId },
      {
        content: card.payload.statement.trim(),
        updatedAt: now
      }
    )

    return 'update'
  }
}

module.exports = {
  hasCards,
  weightShuffleCards,
  paginateCards,
  upsertStatement
}
