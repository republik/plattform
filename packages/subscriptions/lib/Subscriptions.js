const { getObjectByIdAndType } = require('./genericObject')
const Promise = require('bluebird')
const { uuidForObject } = require('@orbiting/backend-modules-utils')
const {
  isUserUnrestricted,
  includesUnrestrictedChildRepoId
} = require('@orbiting/backend-modules-documents/lib/restrictions')
const uniq = require('lodash/uniq')
const { ascending } = require('d3-array')
const { parse, Source } = require('graphql')
const schemaTypes = require('../graphql/schema-types')

const EventObjectTypes = parse(new Source(schemaTypes))
  .definitions.find(
    definition =>
      definition.kind === 'EnumTypeDefinition' &&
      definition.name &&
      definition.name.value === 'EventObjectType'
  )
  .values.map(value => value.name.value)

const objectTypes = ({
  User: 'objectUserId',
  Document: 'objectDocumentId',
  Discussion: 'objectDiscussionId'
})

const buildObjectFindProps = ({ id, type }, t) => {
  const objectColumn = objectTypes[type]
  if (!objectColumn) {
    throw new Error(t('api/unexpected'))
  }
  return {
    objectType: type,
    [objectColumn]: id
  }
}

const getUsersWithSubscriptions = (subscriptions = [], { loaders }) => {
  return Promise.map(
    subscriptions,
    async (sub) => ({
      ...await loaders.User.byId.load(sub.userId),
      __subscription: sub
    })
  )
}

const getIdForSubscription = ({
  userId,
  objectId,
  type
}) => {
  return uuidForObject({
    userId,
    objectId,
    type
  })
}
const getSimulatedSubscriptionForUserAndObject = (
  userId,
  {
    type,
    id
  },
  { t },
  now = new Date()
) => ({
  id: getIdForSubscription({
    userId,
    objectId: id,
    type
  }),
  userId,
  ...buildObjectFindProps({
    id,
    type
  }, t),
  active: false,
  filters: null,
  simulated: true,
  createdAt: now,
  updatedAt: now
})

const upsertSubscription = async (args, context) => {
  const { pgdb, loaders, t } = context
  const { userId, type, filters: rawFilters } = args
  const uniqFilters = rawFilters && uniq(rawFilters)
  // if all EventObjectTypes are set, no filter is set
  const filters = uniqFilters?.length < EventObjectTypes.length
    ? uniqFilters.sort(ascending)
    : null

  if (type === 'User' && userId === args.objectId) {
    throw new Error(t('api/subscriptions/notYourself'))
  }

  const object = await getObjectByIdAndType(
    { id: args.objectId, type },
    context
  )
  if (!object) {
    throw new Error(t('api/subscription/object/404', { id: args.objectId }))
  }
  // normalized id by getObjectByIdAndType
  const objectId = object.objectId || args.objectId

  const findProps = {
    userId,
    ...buildObjectFindProps({
      id: objectId,
      type
    }, t)
  }
  const updateProps = {
    active: true,
    filters
  }

  const transaction = await pgdb.transactionBegin()

  let subscription
  try {
    const existingSubscription = await transaction.public.subscriptions.findOne(findProps)

    if (existingSubscription) {
      subscription = await transaction.public.subscriptions.updateAndGetOne(
        { id: existingSubscription.id },
        {
          ...updateProps,
          updatedAt: new Date()
        }
      )
    } else {
      subscription = await transaction.public.subscriptions.insertAndGet({
        id: getIdForSubscription({
          userId,
          objectId,
          type
        }),
        ...findProps,
        ...updateProps
      })
    }

    await transaction.transactionCommit()
  } catch (e) {
    await transaction.transactionRollback()
    console.error('rollback!', e)
    throw new Error(t('api/unexpected'))
  }

  await Promise.all([
    loaders.Subscription.byId.clear(subscription.id),
    loaders.Subscription.byUserId.clear(subscription.userId)
  ])

  return subscription
}

const unsubscribe = async (id, context) => {
  const { pgdb, loaders, t } = context

  const subscription = await pgdb.public.subscriptions.updateAndGetOne(
    { id },
    { active: false }
  )
  if (!subscription) {
    throw new Error(t('api/subscriptions/404'))
  }
  await Promise.all([
    loaders.Subscription.byId.clear(subscription.id),
    loaders.Subscription.byUserId.clear(subscription.userId)
  ])
  return subscription
}

const getObject = async (subscription, context) => {
  const { objectType: type } = subscription
  return getObjectByIdAndType(
    {
      id: subscription[objectTypes[type]],
      type: subscription.objectType
    },
    context
  )
}

const getSubject = (subscription, context) => {
  const { loaders } = context
  return loaders.User.byId.load(subscription.userId)
}

const getSubscriptionsForUser = (
  userId,
  context,
  {
    includeNotActive = false,
    onlyEligibles = false
  } = {}
) => {
  const { loaders } = context

  return loaders.Subscription.byUserId.load(userId)
    .then(
      subs => includeNotActive
        ? subs
        : subs.filter(sub => sub.active)
    )
    .then(
      subs => onlyEligibles
        ? filterEligibleSubscriptions(subs, context)
        : subs
    )
}

const getSubscriptionsForUserAndObject = (
  userId,
  {
    type,
    id
  },
  context,
  {
    includeNotActive = false,
    onlyEligibles = false
  } = {}
) => {
  const { user: me, pgdb, t } = context
  if (!id) {
    throw new Error(t('api/unexpected'))
  }
  const findProps = {
    ...includeNotActive ? {} : { active: true },
    ...buildObjectFindProps({
      id,
      type
    }, t)
  }
  if (userId && userId === me.id) {
    return getSubscriptionsForUser(userId, context, { includeNotActive, onlyEligibles })
      .then(subs => subs
        .filter(sub => Object.keys(findProps).every(
          key => findProps[key] === sub[key]
        ))
      )
  }
  return pgdb.public.subscriptions.find({
    ...userId ? { userId } : {},
    ...findProps
  })
    .then(
      subs => onlyEligibles
        ? filterEligibleSubscriptions(subs, context)
        : subs
    )
}

const getSubscriptionsForUserAndObjects = (
  userId,
  {
    type,
    ids,
    filter
  },
  context,
  {
    includeNotActive = false,
    onlyEligibles = false
  } = {}
) => {
  const { pgdb, t } = context
  const objectColumn = objectTypes[type]
  if (
    !objectColumn
  ) {
    throw new Error(t('api/unexpected'))
  }

  if (!ids || !ids.length) {
    return []
  }

  if (ids.length === 1 && !filter) {
    return getSubscriptionsForUserAndObject(
      userId,
      {
        type,
        id: ids[0]
      },
      context,
      {
        includeNotActive,
        onlyEligibles
      }
    )
  }

  return pgdb.query(`
    SELECT
      s.*
    FROM
      subscriptions s
    WHERE
      ${userId ? 's."userId" = :userId AND' : ''}
      ARRAY[s."${objectColumn}"] && :objectIds AND
      ${filter ? '(s.filters IS NULL OR s.filters ? :filter) AND' : ''}
      ${includeNotActive ? '' : 's."active" = true AND'}
      s."objectType" = :type
  `, {
    ...userId ? { userId } : {},
    type,
    objectIds: ids,
    filter
  })
    .then(
      subs => onlyEligibles
        ? filterEligibleSubscriptions(subs, context)
        : subs
    )
}

const subscriptionIsEligibleForNotifications = async (
  subscription,
  context
) => {
  const [user, object] = await Promise.all([
    getSubject(subscription, context),
    getObject(subscription, context)
  ])
  if (object.__typename === 'Document') {
    return (
      isUserUnrestricted(user) ||
      includesUnrestrictedChildRepoId([object.objectId])
    )
  }
  return true
}

const filterEligibleSubscriptions = (subscriptions, context) => {
  return Promise.filter(
    subscriptions,
    sub => subscriptionIsEligibleForNotifications(sub, context)
  )
}

const getUnreadNotificationsForUserAndObject = (
  userId,
  {
    type,
    id
  },
  { loaders }
) => {
  // the keys provided to load may match multiple notifications
  return loaders.Notification.byKeyObj({ many: true }).load({
    userId,
    eventObjectType: type,
    eventObjectId: id,
    readAt: null
  })
}

module.exports = {
  EventObjectTypes,
  getUsersWithSubscriptions,

  upsertSubscription,
  unsubscribe,
  getObject,
  getSubject,

  getSimulatedSubscriptionForUserAndObject,

  getSubscriptionsForUser,
  getSubscriptionsForUserAndObject,
  getSubscriptionsForUserAndObjects,

  subscriptionIsEligibleForNotifications,
  getUnreadNotificationsForUserAndObject
}
