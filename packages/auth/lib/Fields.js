const moment = require('moment')

const { newAuthError } = require('./AuthError')
const Roles = require('./Roles')

const MissingFieldsError = newAuthError(
  'missing-fields',
  'api/fields/missing'
)

const getMissingFields = async ({ user, email, pgdb }) => {
  const missingFields = []
  const unassignedGrants = await pgdb.public.accessGrants.find({
    email,
    recipientUserId: null,
    'beginAt <=': moment(),
    'endAt >': moment(),
    invalidatedAt: null
  })

  const isMember = !!user && Roles.userHasRole(user, 'member')
  const hasNames = !!user && (
    user.firstName &&
    user.firstName.trim().length > 1 &&
    user.lastName &&
    user.lastName.trim().length > 1
  )
  const hasGrants = unassignedGrants.length > 0

  if (
    (user && isMember && !hasNames) ||
    (!user && hasGrants)
  ) {
    missingFields.push('firstName')
    missingFields.push('lastName')
  }

  return missingFields
}

const ensureRequiredFields = async ({ user, email, providedFields, pgdb }) => {
  const missingFields = []
  const fields = {}

  const expectedFields = await getMissingFields({ user, email, pgdb })

  expectedFields
    .forEach(expectedField => {
      if (!providedFields[expectedField]) {
        missingFields.push(expectedField)
        return false
      }

      fields[expectedField] = providedFields[expectedField]
    })

  if (missingFields.length > 0) {
    throw new MissingFieldsError(
      missingFields,
      { fields: missingFields.join(', ') }
    )
  }

  return fields
}

module.exports = {
  getMissingFields,
  ensureRequiredFields
}
