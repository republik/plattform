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

  if (
    Roles.userHasRole(user, 'member') ||
    (!user && unassignedGrants.length > 0)
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
