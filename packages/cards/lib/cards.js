const shuffleSeed = require('shuffle-seed')
const { ascending } = require('d3-array')

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

const buildDeck = (cards, seed, focus = [], smartspider = []) => {
  const smartspiderCount = smartspider.filter(s => s !== null && s >= 0).length

  const deck =
    cards
      .map(card => {
        const distances = []
        const { payload: { smartvoteCleavage } } = card

        Array.from(Array(8).keys()).forEach((_, index) => {
          if (
            smartvoteCleavage &&
            smartvoteCleavage[index] !== null &&
            smartspider[index] !== null &&
            smartspider[index] >= 0
          ) {
            distances.push(Math.abs(smartvoteCleavage[index] - smartspider[index]))
          } else if (smartspider[index] !== null && smartspider[index] >= 0) {
            distances.push(100)
          } else {
            distances.push(0)
          }
        })

        return {
          ...card,
          _distance: +(distances.reduce((a, c) => a + c, 0) / smartspiderCount).toFixed(2)
        }
      })
      .map(card => {
        const _mandates =
          0 +
          (card.payload.nationalCouncil && card.payload.nationalCouncil.incumbent ? 1 : 0) +
          (card.payload.councilOfStates && card.payload.councilOfStates.incumbent ? 1 : 0)

        return {
          ...card,
          _mandates
        }
      })

  deck.forEach(card => {
    const { payload } = card
    const { nationalCouncil } = payload

    if (nationalCouncil.electionPlausibility === 'GOOD') {
      deck.push(card)
      deck.push(card)
      deck.push(card)
    }

    if (nationalCouncil.electionPlausibility === 'DECENT') {
      deck.push(card)
      deck.push(card)
    }

    if (payload.statement) {
      deck.push(card)
      deck.push(card)
      deck.push(card)
    }
  })

  const focusCards =
    deck
      .filter(c => focus.includes(c.id))
      .sort((a, b) => ascending(focus.indexOf(a.id), focus.indexOf(b.id)))

  const smartspiderRelevantCards =
    deck
      .filter(c => c._distance < 100)
      .sort((a, b) => ascending(a._distance, b._distance))

  const shuffledCards = shuffleSeed.shuffle(deck, seed)

  return removeDuplicates([
    ...focusCards,
    ...smartspiderRelevantCards,
    ...shuffledCards
  ], 'id')
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

  // { fractions: [ <fraction 1>, ...<fraction n> ]}
  if (filteredCards.length > 0 && filters.fractions) {
    filteredCards = filteredCards.filter(card => (
      card.payload &&
      card.payload.fraction &&
      filters.fractions.includes(card.payload.fraction)
    ))
  }

  // { partyParents: [ <partyParent 1>, ...<partyParent n> ]}
  if (filteredCards.length > 0 && filters.partyParents) {
    filteredCards = filteredCards.filter(card => (
      card.payload &&
      card.payload.partyParent &&
      filters.partyParents.includes(card.payload.partyParent)
    ))
  }

  // { subscribedByMe: <Boolean> }
  if (filteredCards.length > 0 && filters.subscribedByMe) {
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

  // { mustHave: [ <value 1>, ... <value 2> ] }
  if (filteredCards.length > 0 && filters.mustHave) {
    const mustHavePortrait = filters.mustHave.includes('portrait')
    const mustHaveSmartspider = filters.mustHave.includes('smartspider')
    const mustHaveStatement = filters.mustHave.includes('statement')
    const mustHaveFinancing = filters.mustHave.includes('financing')

    const portrayedUserId = (await context.pgdb.public.users.find({
      id: filteredCards.map(c => c.userId),
      'portraitUrl !=': null
    })).map(u => u.id)

    filteredCards = filteredCards.filter(card => {
      return (
        (!mustHavePortrait || portrayedUserId.includes(card.userId)) &&
        (!mustHaveSmartspider || !!card.payload.smartvoteCleavage) &&
        (!mustHaveStatement || !!card.payload.statement) &&
        (!mustHaveFinancing || !!card.payload.financing)
      )
    })
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
    (args, payload) => buildDeck(
      filteredCards,
      payload.seed,
      args.focus,
      args.sort && args.sort.smartspider
    )
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
  paginateCards,
  upsertStatement
}
