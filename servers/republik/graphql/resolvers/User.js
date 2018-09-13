const { Roles } = require('@orbiting/backend-modules-auth')
const { age } = require('../../lib/age')
const { getKeyId } = require('../../lib/pgp')
const querystring = require('querystring')

const { isEligible } = require('../../lib/profile')

// the first 4 are old portrait URL legacy
const {
  ASSETS_BASE_URL,
  ASSETS_SERVER_BASE_URL,
  AWS_S3_BUCKET,
  AWS_S3_BUCKET_PROD
} = process.env

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
    user._raw[accessRoleKey] === 'PUBLIC' ||
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
  portrait (user, args, { user: me, req }) {
    if (canAccessBasics(user, me)) {
      let { portraitUrl } = user._raw
      if (!portraitUrl) {
        return portraitUrl
      }
      // TODO migrate DB entries from _384x384 to _original and from ASSETS_BASE_URL to ASSETS_SERVER_BASE_URL/s3/AWS_S3_BUCKET
      const legacyMode = portraitUrl.indexOf('_384x384') > -1
      if (legacyMode) {
        portraitUrl = portraitUrl.replace('_384x384', '_original')
        portraitUrl = portraitUrl.replace(ASSETS_BASE_URL, `${ASSETS_SERVER_BASE_URL}/s3/${AWS_S3_BUCKET_PROD || AWS_S3_BUCKET}`)
      }
      const bw = args && args.properties && args.properties.bw !== undefined
        ? args.properties.bw
        : true // bw is default for portrait images
      let resize
      if (args && args.properties) {
        const { width, height } = args.properties
        resize = `${width || ''}x${height || ''}`
      } else if ((args && args.size) || legacyMode) { // PortraitSize is deprecated
        resize = args && args.size === 'SHARE'
          ? '1000x1000'
          : '384x384'
      } else {
        resize = '384x384' // default for portraits
      }
      const [url, query] = portraitUrl.split('?')
      const newQuery = querystring.stringify({
        ...querystring.parse(query),
        resize,
        bw
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
  badges: exposeProfileField('badges'),
  biography: exposeProfileField('biography'),
  facebookId: exposeProfileField('facebookId'),
  twitterHandle: exposeProfileField('twitterHandle'),
  publicUrl: exposeProfileField('publicUrl'),
  disclosures: exposeProfileField('disclosures'),
  async comments (user, args, { pgdb, user: me }) {
    const emptyCommentConnection = {
      id: user.id,
      totalCount: 0,
      pageInfo: null,
      nodes: []
    }
    if (!Roles.userIsMeOrHasProfile(user, me)) {
      return emptyCommentConnection
    }
    const {
      first: _first = 10,
      after
    } = args
    const first = Math.min(_first, 100)

    const comments = await pgdb.query(`
      SELECT
        c.*,
        to_json(d.*) AS discussion
      FROM
        comments c
      JOIN
        discussions d
        ON d.id = c."discussionId"
      LEFT JOIN
        "discussionPreferences" dp
        ON
          dp."discussionId" = d.id AND
          dp."userId" = :userId
      WHERE
        c."userId" = :userId AND
        d.anonymity != 'ENFORCED' AND
        (dp IS NULL OR dp.anonymous = false)
      ORDER BY
        c."createdAt" DESC
    `, {
      userId: user.id
    })
    const totalCount = comments.length

    if (!me || !Roles.userIsInRoles(me, ['member']) || !comments.length) {
      return {
        ...emptyCommentConnection,
        totalCount
      }
    }

    const afterId = after
      ? Buffer.from(after, 'base64').toString('utf-8')
      : null

    let startIndex = 0
    if (afterId) {
      startIndex = comments.findIndex(node => node.id === afterId)
    }
    const endIndex = startIndex + first
    const nodes = comments.slice(startIndex, endIndex)

    return {
      id: user.id,
      totalCount,
      pageInfo: {
        endCursor: nodes.length
          ? Buffer.from(`${nodes[nodes.length - 1].id}`).toString('base64')
          : null,
        hasNextPage: endIndex < comments.length
      },
      nodes
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
