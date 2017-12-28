const { Roles } = require('@orbiting/backend-modules-auth')
const { age } = require('../../lib/age')
const { getKeyId } = require('../../lib/pgp')
const { getImageUrl } = require('../../lib/convertImage')
const { isEligible } = require('../../lib/profile')

const exposeProfileField = (key, format) => (user, args, { pgdb, user: me }) => {
  if (Roles.userIsMeOrHasProfile(user, me)) {
    return format
      ? format(user._raw[key], args)
      : user._raw[key]
  }
  return null
}

const exposeAccessField = (accessRoleKey, key, format) => (user, args, { pgdb, user: me }) => {
  if (
    user._raw[accessRoleKey] === 'public' ||
    Roles.userIsMeOrInRoles(user, me, [
      user._raw[accessRoleKey].toLowerCase(),
      'admin', 'supporter'
    ])
  ) {
    return format
      ? format(user._raw[key])
      : user._raw[key]
  }
  return null
}

// statement & portrait and related content
const canAccessBasics = (user, me) => (
  Roles.userIsMeOrHasProfile(user, me) ||
  (user._raw.isListed && !user._raw.isAdminUnlisted)
)

module.exports = {
  isListed: (user) => user._raw.isListed,
  isAdminUnlisted (user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return user._raw.isAdminUnlisted
    }
    return null
  },
  isEligibleForProfile (user, args, { user: me, pgdb }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return isEligible(user.id, pgdb)
    }
    return null
  },
  statement (user, args, { user: me }) {
    if (canAccessBasics(user, me)) {
      return user._raw.statement
    }
    return null
  },
  async sequenceNumber (user, args, { pgdb, user: me }) {
    if (canAccessBasics(user, me)) {
      if (user._raw.sequenceNumber) {
        return user._raw.sequenceNumber
      }
      const firstMembership = await pgdb.public.memberships.findFirst({userId: user.id}, {orderBy: ['sequenceNumber asc']})
      if (firstMembership) {
        return firstMembership.sequenceNumber
      }
    }
    return null
  },
  portrait (user, args, { user: me }) {
    if (canAccessBasics(user, me)) {
      const { portraitUrl } = user._raw
      return portraitUrl
        ? getImageUrl(portraitUrl, args)
        : portraitUrl
    }
    return null
  },
  pgpPublicKey: exposeAccessField('emailAccessRole', 'pgpPublicKey'),
  pgpPublicKeyId: exposeAccessField('emailAccessRole', 'pgpPublicKey', key => key
    ? getKeyId(key)
    : null
  ),
  email: exposeAccessField('emailAccessRole', 'email'),
  emailAccessRole (user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return user._raw.emailAccessRole
    }
    return null
  },
  phoneNumber: exposeAccessField('phoneNumberAccessRole', 'phoneNumber'),
  phoneNumberNote: exposeAccessField('phoneNumberAccessRole', 'phoneNumberNote'),
  phoneNumberAccessRole (user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return user._raw.phoneNumberAccessRole
    }
    return null
  },
  badges: exposeProfileField('badges'),
  biography: exposeProfileField('biography'),
  facebookId: exposeProfileField('facebookId'),
  twitterHandle: exposeProfileField('twitterHandle'),
  publicUrl: exposeProfileField('publicUrl'),
  async latestComments (user, args, { pgdb, user: me }) {
    if (!Roles.userIsMeOrHasProfile(user, me)) {
      return null
    }
    const userId = user.id
    const limit = args.limit || 10

    const comments = await pgdb.query(
      `
      SELECT
        c.id,
        c."userId",
        c.content,
        c."adminUnpublished",
        c.published,
        c."createdAt",
        c."updatedAt",
        c."discussionId",
        d.title AS "discussionTitle"
      FROM comments c
      JOIN discussions d ON d.id = c."discussionId"
      WHERE
        c."userId" = :userId
      ORDER BY
        c."createdAt" DESC
      LIMIT :limit;
    `,
      { userId, limit }
    )

    if (comments.length) {
      return comments.map(comment => {
        return {
          ...comment,
          discussion: {
            id: comment.discussionId,
            title: comment.discussionTitle
          }
        }
      })
    }
  },
  birthday (user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return user._raw.birthday
    }
    return null
  },
  age: exposeAccessField('ageAccessRole', 'birthday', dob => dob
    ? age(dob)
    : null
  ),
  async credentials (user, args, { pgdb, user: me }) {
    const canAccessListed = canAccessBasics(user, me)
    const canAccessAll = Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])
    if (canAccessListed || canAccessAll) {
      // ToDo: optimize for statements (adds 40ms per 100 records)
      const all = await pgdb.public.credentials.find({
        userId: user.id
      })
      if (canAccessAll) {
        return all
      }
      const allListed = all.filter(c => c.isListed)
      return allListed
    }
  },
  async address (user, args, {pgdb, user: me}) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      if (!user._raw.addressId) {
        return null
      }
      return pgdb.public.addresses.findOne({
        id: user._raw.addressId
      })
    }
    return null
  }
}
