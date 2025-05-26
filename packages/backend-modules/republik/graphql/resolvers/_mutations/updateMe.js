const {
  ensureSignedIn,
  checkUsername,
  transformUser,
  Users,
  Roles,
} = require('@orbiting/backend-modules-auth')
const { getKeyId, containsPrivateKey } = require('../../../lib/pgp')
const {
  isEligible,
  isInCandidacy,
  isInCandidacyInCandidacyPhase,
  isInCandidacyInElectionPhase,
} = require('../../../lib/profile')
const { upsertAddress } = require('../../../lib/address')
const {
  Redirections: { upsert: upsertRedirection, delete: deleteRedirection },
} = require('@orbiting/backend-modules-redirections')

const {
  lib: { Portrait },
} = require('@orbiting/backend-modules-assets')
const { ensureStringLength } = require('@orbiting/backend-modules-utils')

const MAX_STATEMENT_LENGTH = 140
const MAX_BIOGRAPHY_LENGTH = 2000
const MAX_DISCLOSURES_LENGTH = 140

// a resonable 4k key is around 3k to 10k chars (radix64 data + armour)
// - however key file can contain meta data
// - some people already have 8k keys
// - a key will also need to pass getKeyId before we store it
// therefore lets use a way too high limit
const MAX_PUBLIC_KEY_LENGTH = 524288 // 0.5mb

const MAX_PHONE_NUMBER_NOTE_LENGTH = 140
const MAX_PHONE_NUMBER_LENGTH = 20 // 20 (15 digits but let's give 5 spaces for formatting, e.g. 0049 XXX XX XX XX XX)
const MAX_FIRSTNAME_LENGTH = 32
const MAX_LASTNAME_LENGTH = 32
const MAX_PROLITTERISID_LENGTH = 20

const createEnsureStringLengthForProfile =
  (values, t) =>
  (key, translationKey, max, min = 0) =>
    ensureStringLength(values[key], {
      min,
      max,
      error: t(`profile/generic/${min > 0 ? 'notInRange' : 'tooLong'}`, {
        key: t(translationKey),
        max,
        min,
      }),
    })

module.exports = async (_, args, context) => {
  const { pgdb, req, user: me, t, mail } = context
  ensureSignedIn(req)

  const {
    phoneNumber,
    username,
    address,
    pgpPublicKey,
    portrait,
    statement,
    isListed,
  } = args

  const ensureStringLengthForProfile = createEnsureStringLengthForProfile(
    args,
    t,
  )
  ensureStringLengthForProfile(
    'statement',
    'profile/statement/label',
    MAX_STATEMENT_LENGTH,
  )
  ensureStringLengthForProfile(
    'biography',
    'profile/biography/label',
    MAX_BIOGRAPHY_LENGTH,
  )
  ensureStringLengthForProfile(
    'pgpPublicKey',
    'profile/contact/pgpPublicKey/label',
    MAX_PUBLIC_KEY_LENGTH,
  )
  ensureStringLengthForProfile(
    'phoneNumberNote',
    'profile/contact/phoneNumberNote/label',
    MAX_PHONE_NUMBER_NOTE_LENGTH,
  )
  ensureStringLengthForProfile(
    'phoneNumber',
    'profile/contact/phoneNumber/label',
    MAX_PHONE_NUMBER_LENGTH,
  )
  ensureStringLengthForProfile(
    'firstName',
    'pledge/contact/firstName/label',
    MAX_FIRSTNAME_LENGTH,
    1,
  )
  ensureStringLengthForProfile(
    'lastName',
    'pledge/contact/lastName/label',
    MAX_LASTNAME_LENGTH,
    1,
  )
  ensureStringLengthForProfile(
    'prolitterisId',
    'profile/contact/prolitterisId/label',
    MAX_PROLITTERISID_LENGTH,
  )
  ensureStringLengthForProfile(
    'disclosures',
    'profile/disclosures/label',
    MAX_DISCLOSURES_LENGTH,
  )

  const updateFields = [
    'username',
    'firstName',
    'lastName',
    'ageAccessRole',
    'phoneNumberNote',
    'phoneNumberAccessRole',
    'prolitterisId',
    'profileUrls',
    'emailAccessRole',
    'pgpPublicKey',
    'hasPublicProfile',
    'biography',
    'isListed',
    'statement',
    'disclosures',
    'gender',
    'birthyear',
  ]

  if (
    (isListed && !me._raw.isListed) ||
    (args.hasPublicProfile && !me.hasPublicProfile)
  ) {
    // Authors always have the option to make their profile public,
    // we can skip the DB check if the user has the role 'author'.
    const check =
      Roles.userHasRole(me, 'author') || (await isEligible(me, pgdb))
    if (!check) {
      throw new Error(t('profile/notEligible'))
    }
  }

  if (await isInCandidacy(me._raw, pgdb)) {
    if (await isInCandidacyInCandidacyPhase(me._raw, pgdb)) {
      if (args.hasPublicProfile === false) {
        throw new Error(t('profile/candidacy/needed'))
      }

      if (
        'birthyear' in args &&
        (args.birthyear === null)
      ) {
        throw new Error(t('profile/candidacy/birthyear/needed'))
      }

      if ('statement' in args && args.statement.length < 1) {
        throw new Error(t('profile/candidacy/statement/needed'))
      }

      if ('biography' in args && args.biography.length < 1) {
        throw new Error(t('profile/candidacy/biography/needed'))
      }

      if ('gender' in args && args.gender.length < 1) {
        throw new Error(t('profile/candidacy/gender/needed'))
      }

      if ('portrait' in args && !portrait) {
        throw new Error(t('profile/candidacy/portrait/needed'))
      }
    }
    if (await isInCandidacyInElectionPhase(me._raw, pgdb)) {
      if (
        'hasPublicProfile' in args ||
        'birthyear' in args ||
        'statement' in args ||
        'biography' in args ||
        'gender' in args
      ) {
        throw new Error(t('profile/candidacy/electionPhase'))
      }
    }
  }

  if (isListed || (isListed === undefined && me._raw.isListed)) {
    if (
      !(statement && statement.trim()) &&
      !(
        statement === undefined &&
        me._raw.statement &&
        me._raw.statement.trim()
      )
    ) {
      throw new Error(t('profile/statement/needed'))
    }

    if (!portrait && !(portrait === undefined && me._raw.portraitUrl)) {
      throw new Error(t('profile/portrait/needed'))
    }
  }

  if (username !== undefined && username !== null) {
    await checkUsername(username, me, pgdb)
  }
  if (
    args.hasPublicProfile &&
    !username &&
    (!me.username || username === null)
  ) {
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
    if (await containsPrivateKey(pgpPublicKey)) {
      throw new Error(t('api/pgpPublicKey/private'))
    }
    if (!(await getKeyId(pgpPublicKey))) {
      throw new Error(t('api/pgpPublicKey/invalid'))
    }
  }
  if (args.birthyear) {
    if (args.birthyear < 1900 || args.birthyear > new Date().getFullYear()) {
      throw new Error(t('api/user/birthyearInvalid'))
    }
  }

  // {portrait} is an argument, which can either contain a a b64 encoded image,
  // be null or undefined.
  // If image is provided, we'll attempt to upload it and update portraitUrl
  // If null is set, we will delete current image after Postgres transaction
  // If undefined is set, we won't tinker with portrait URL
  const portraitUrl =
    (portrait && (await Portrait.upload(portrait))) || portrait

  const transaction = await pgdb.transactionBegin()
  const now = new Date()
  try {
    if (
      updateFields.some((field) => args[field] !== undefined) ||
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
            updatedAt: new Date(),
          },
        ),
        { skipUndefined: true },
      )
      if (username) {
        // claim other's redirection
        await deleteRedirection(
          {
            source: `/~${username}`,
          },
          context,
          now,
        )
      }
      if (me.username && username && me.username !== username) {
        await upsertRedirection(
          {
            source: `/~${me.username}`,
            target: `/~${username}`,
            resource: { user: { id: me.id } },
            status: 302, // allow reclaiming by somebody else
          },
          context,
          now,
        )
      }
    }

    if (address) {
      const { id: addressId } = await upsertAddress(
        { ...address, id: me._raw?.addressId },
        transaction,
        t,
      )

      if (!me._raw.addressId) {
        // link upserted address to user
        await transaction.public.users.updateOne(
          { id: me.id },
          { addressId, updatedAt: now },
        )
      }
    }

    if (phoneNumber) {
      await Users.updateUserPhoneNumber({
        pgdb: transaction,
        userId: me.id,
        phoneNumber,
      })
    }

    await transaction.transactionCommit()

    const updatedUser = await pgdb.public.users.findOne({ id: me.id })

    if (
      me._raw.portraitUrl &&
      updatedUser.portraitUrl !== me._raw.portraitUrl
    ) {
      await Portrait.del(me._raw.portraitUrl).catch((e) =>
        console.warn('Unable to delete portraitUrl after update: %o', {
          portraitUrl: me._raw.portraitUrl,
          error: e.message,
          user: me.id,
        }),
      )
    }

    await mail.updateNameMergeFields({ user: updatedUser })

    return transformUser(updatedUser)
  } catch (e) {
    await transaction.transactionRollback()

    if (portraitUrl !== me._raw.portraitUrl) {
      await Portrait.del(portraitUrl).catch((e) =>
        console.warn('Unable to delete portraitUrl after rolling back: %o', {
          portraitUrl,
          error: e.message,
          user: me.id,
        }),
      )
    }

    console.log('updateMe', e)
    if (e.translated) {
      throw e
    }

    throw new Error(t('api/unexpected'))
  }
}
