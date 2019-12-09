const { Roles, AccessToken: { isFieldExposed } } = require('@orbiting/backend-modules-auth')
const { age } = require('../../lib/age')
const { getKeyId } = require('../../lib/pgp')
const querystring = require('querystring')

const { isEligible } = require('../../lib/profile')

const canAccessBasics = (user, me) => (
  Roles.userIsMeOrProfileVisible(user, me)
)

const exposeProfileField = (key, format) => (user, args, { pgdb, user: me }) => {
  if (canAccessBasics(user, me) || isFieldExposed(user, key)) {
    return format
      ? format(user._raw[key] || user[key], args)
      : user._raw[key] || user[key]
  }
  return null
}

const exposeAccessField = (accessRoleKey, key, format) => (user, args, { pgdb, user: me }) => {
  if (
    (
      user._raw[accessRoleKey] === 'PUBLIC' ||
      Roles.userIsMeOrInRoles(user, me, [
        user._raw[accessRoleKey].toLowerCase(),
        'admin', 'supporter'
      ])
    ) || isFieldExposed(user, key)
  ) {
    return format
      ? format(user._raw[key] || user[key])
      : user._raw[key] || user[key]
  }
  return null
}

module.exports = {
  name (user, args, { user: me }) {
    if (canAccessBasics(user, me)) {
      return user.name
    }
    return user.initials
  },
  firstName: exposeProfileField('firstName'),
  lastName: exposeProfileField('lastName'),
  username: exposeProfileField('username'),
  badges: exposeProfileField('badges'),
  biography: exposeProfileField('biography'),
  facebookId: exposeProfileField('facebookId'),
  twitterHandle: exposeProfileField('twitterHandle'),
  publicUrl: exposeProfileField('publicUrl'),
  disclosures: exposeProfileField('disclosures'),
  statement: exposeProfileField('statement'),
  isListed: (user) => user._raw.isListed,
  slug (user, args, { user: me }) {
    if (canAccessBasics(user, me)) {
      return user._raw.username || user._raw.id
    }
    return null
  },
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
  async sequenceNumber (user, args, { pgdb, user: me }) {
    if (canAccessBasics(user, me)) {
      if (user._raw.sequenceNumber) {
        return user._raw.sequenceNumber
      }
      const firstMembership = await pgdb.public.memberships.findFirst({ userId: user.id }, { orderBy: ['sequenceNumber asc'] })
      if (firstMembership) {
        return firstMembership.sequenceNumber
      }
    }
    return null
  },
  portrait (user, args, { user: me, req, allowAccess = false }) {
    if (allowAccess || canAccessBasics(user, me)) {
      const { portraitUrl } = user._raw
      if (!portraitUrl) {
        return portraitUrl
      }
      const bw = args && args.properties && args.properties.bw !== undefined
        ? args.properties.bw
        : true // bw is default for portrait images
      let resize
      if (args && args.properties) {
        const { width, height } = args.properties
        resize = `${width || ''}x${height || ''}`
      } else if (args && args.size === 'SHARE') { // PortraitSize is deprecated
        resize = '1000x1000'
      } else {
        resize = '384x384' // default for portraits
      }
      const [url, query] = portraitUrl.split('?')
      const newQuery = querystring.stringify({
        ...querystring.parse(query),
        resize,
        bw: bw || undefined
      })
      const webp = args && args.webp !== undefined
        ? args.webp
        : req && req.get('Accept').indexOf('image/webp') > -1
      return `${url}${webp ? '.webp' : ''}?${newQuery}`
    }
    return null
  },
  pgpPublicKey: exposeAccessField('emailAccessRole', 'pgpPublicKey'),
  pgpPublicKeyId: exposeAccessField('emailAccessRole', 'pgpPublicKey', key => key
    ? getKeyId(key)
    : null
  ),
  email: (user, ...rest) => {
    // special case for pledging: check modules/crowdfundings/graphql/resolvers/Pledge.js
    if (user._exposeEmail) {
      return user.email
    }
    return exposeAccessField('emailAccessRole', 'email')(user, ...rest)
  },
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
    return []
  },
  async address (user, args, { pgdb, user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      if (!user._raw.addressId) {
        return null
      }
      return pgdb.public.addresses.findOne({
        id: user._raw.addressId
      })
    }
    return null
  },
  hasAddress (user, args, { user: me }) {
    if (
      Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter']) ||
      isFieldExposed(user, 'hasAddress')
    ) {
      return !!user._raw.addressId
    }
    return null
  },
  newsletterSettings (user, args, { user: me, t, mail: { getNewsletterSettings }, ...context }) {
    Roles.ensureUserIsMeOrInRoles(user, me, ['admin', 'supporter'])
    try {
      return getNewsletterSettings({ user })
    } catch (error) {
      console.error('getNewsletterProfile failed', { error })
      throw new Error(t('api/newsletters/get/failed'))
    }
  },
  defaultDiscussionNotificationOption (user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return user._raw.defaultDiscussionNotificationOption
    }
    return null
  },
  discussionNotificationChannels (user, args, { user: me }) {
    if (Roles.userIsMeOrInRoles(user, me, ['admin', 'supporter'])) {
      return user._raw.discussionNotificationChannels
    }
    return []
  }
}
