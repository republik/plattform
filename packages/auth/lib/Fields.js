const debug = require('debug')('auth:lib:Fields')
const moment = require('moment')

const { newAuthError } = require('./AuthError')
const Roles = require('./Roles')

const MissingFieldsError = newAuthError(
  'missing-fields',
  'api/fields/missing'
)

const hasGrants = async ({ user, email, pgdb }) => {
  const unassignedGrants = await pgdb.public.accessGrants.find({
    email,
    recipientUserId: null,
    'beginAt <=': moment(),
    'endAt >': moment(),
    invalidatedAt: null
  })

  debug('hasGrants', unassignedGrants.length > 0)

  return unassignedGrants.length > 0
}

const getMissingFields = async ({ user, email, pgdb }) => {
  const missingFields = []

  const isMember = !!user && Roles.userHasRole(user, 'member')
  const hasNames = !!user && (
    user.firstName &&
    user.firstName.trim().length > 1 &&
    user.lastName &&
    user.lastName.trim().length > 1
  )

  if (
    (user && isMember && !hasNames) ||
    (!user && await hasGrants({ user, email, pgdb }))
  ) {
    missingFields.push('firstName')
    missingFields.push('lastName')
  }

  return missingFields
}

const ensureRequiredFields = async ({ user, email, providedFields, pgdb }) => {
  const missingFields = []
  const requiredFields = {}

  const expectedFields = await getMissingFields({ user, email, pgdb })

  expectedFields
    .forEach(expectedField => {
      if (!providedFields[expectedField]) {
        missingFields.push(expectedField)
        return false
      }

      requiredFields[expectedField] = providedFields[expectedField]
    })

  if (missingFields.length > 0) {
    throw new MissingFieldsError(
      missingFields,
      { fields: missingFields.join(', ') }
    )
  }

  return requiredFields
}

module.exports = {
  getMissingFields,
  ensureRequiredFields
}
