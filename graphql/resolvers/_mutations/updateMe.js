const crypto = require('crypto')
const {
  ensureSignedIn, checkUsername, transformUser
} = require('@orbiting/backend-modules-auth')
const {
  getKeyId,
  containsPrivateKey
} = require('../../../lib/pgp')
const { isEligible } = require('../../../lib/profile')
const { Redirections: { upsert: upsertRedirection } } = require('@orbiting/backend-modules-redirections')

const convertImage = require('../../../lib/convertImage')
const uploadExoscale = require('../../../lib/uploadExoscale')

const {
  ASSETS_BASE_URL,
  S3BUCKET
} = process.env

const MAX_STATEMENT_LENGTH = 140
const PORTRAIT_FOLDER = 'portraits'

const {
  IMAGE_ORIGINAL_SUFFIX,
  IMAGE_SMALL_SUFFIX,
  IMAGE_SHARE_SUFFIX
} = convertImage

module.exports = async (_, args, context) => {
  const { pgdb, req, user: me, t } = context
  ensureSignedIn(req)

  const {
    username,
    address,
    pgpPublicKey,
    portrait,
    statement,
    isListed
  } = args

  const updateFields = [
    'username',
    'firstName',
    'lastName',
    'birthday',
    'ageAccessRole',
    'phoneNumber',
    'phoneNumberNote',
    'phoneNumberAccessRole',
    'facebookId',
    'twitterHandle',
    'publicUrl',
    'emailAccessRole',
    'pgpPublicKey',
    'hasPublicProfile',
    'biography',
    'isListed',
    'statement'
  ]

  let portraitUrl = portrait === null
    ? null
    : undefined

  if (
    (isListed && !me._raw.isListed) ||
    (args.hasPublicProfile && !me.hasPublicProfile)
  ) {
    const check = await isEligible(me.id, pgdb)
    if (!check) {
      throw new Error(t('profile/notEligible'))
    }
  }

  if (statement) {
    if (statement.length > MAX_STATEMENT_LENGTH) {
      throw new Error(t('profile/statement/tooLong'))
    }
  }
  if (isListed || (isListed === undefined && me._raw.isListed)) {
    if (
      !(statement && statement.trim()) &&
      !(statement === undefined && me._raw.statement && me._raw.statement.trim())
    ) {
      throw new Error(t('profile/statement/needed'))
    }
    if (
      !portrait &&
      !(portrait === undefined && me._raw.portraitUrl)
    ) {
      throw new Error(t('profile/portrait/needed'))
    }
  }

  if (portrait) {
    const inputBuffer = Buffer.from(portrait, 'base64')

    const portaitBasePath = [
      `/${PORTRAIT_FOLDER}/`,
      // always a new path—cache busters!
      crypto.createHash('md5').update(portrait).digest('hex')
    ].join('')

    // IMAGE_SMALL_SUFFIX for cf compat
    portraitUrl = `${ASSETS_BASE_URL}${portaitBasePath}${IMAGE_SMALL_SUFFIX}`

    await Promise.all([
      convertImage.toJPEG(inputBuffer)
        .then((data) => {
          return uploadExoscale({
            stream: data,
            path: `${portaitBasePath}${IMAGE_ORIGINAL_SUFFIX}`,
            mimeType: 'image/jpeg',
            bucket: S3BUCKET
          })
        }),
      convertImage.toSmallBW(inputBuffer)
        .then((data) => {
          return uploadExoscale({
            stream: data,
            path: `${portaitBasePath}${IMAGE_SMALL_SUFFIX}`,
            mimeType: 'image/jpeg',
            bucket: S3BUCKET
          })
        }),
      convertImage.toShare(inputBuffer)
        .then((data) => {
          return uploadExoscale({
            stream: data,
            path: `${portaitBasePath}${IMAGE_SHARE_SUFFIX}`,
            mimeType: 'image/jpeg',
            bucket: S3BUCKET
          })
        })
    ])
  }

  if (username !== undefined && username !== null) {
    await checkUsername(username, me, pgdb)
  }
  if (args.hasPublicProfile && !username && (!me.username || username === null)) {
    throw new Error(t('api/publicProfile/usernameRequired'))
  }
  if (
    username === null &&
    me.hasPublicProfile &&
    args.hasPublicProfile !== false
  ) {
    throw new Error(t('api/publicProfile/usernameNeeded'))
  }
  if (pgpPublicKey) {
    if (containsPrivateKey(pgpPublicKey)) {
      throw new Error(t('api/pgpPublicKey/private'))
    }
    if (!getKeyId(pgpPublicKey)) {
      throw new Error(t('api/pgpPublicKey/invalid'))
    }
  }

  const transaction = await pgdb.transactionBegin()
  try {
    if (
      updateFields.some(field => args[field] !== undefined) ||
      portraitUrl !== undefined
    ) {
      await transaction.public.users.updateOne(
        { id: me.id },
        updateFields.reduce(
          (updates, key) => {
            updates[key] = args[key]
            return updates
          },
          {
            portraitUrl,
            updatedAt: new Date()
          }
        ),
        { skipUndefined: true }
      )
      if (me.username && username && me.username !== username) {
        await upsertRedirection({
          source: `/~${me.username}`,
          target: `/~${username}`,
          resource: { user: { id: me.id } },
          status: 302 // allow reclaiming by somebody else
        }, context)
      }
    }
    if (address) {
      if (me._raw.addressId) {
        // update address of user
        await transaction.public.addresses.updateOne(
          { id: me._raw.addressId },
          {
            ...address,
            updatedAt: new Date()
          }
        )
      } else {
        // user has no address yet
        const userAddress = await transaction.public.addresses.insertAndGet(
          address
        )
        await transaction.public.users.updateOne(
          { id: me.id },
          { addressId: userAddress.id, updatedAt: new Date() }
        )
      }
    }
    await transaction.transactionCommit()
    const updatedUser = await pgdb.public.users.findOne({ id: me.id })
    return transformUser(updatedUser)
  } catch (e) {
    console.error('updateMe', e)
    await transaction.transactionRollback()
    throw new Error(t('api/unexpected'))
  }
}
