const { hasUserActiveMembership } = require('@orbiting/backend-modules-utils')

const { newAuthError } = require('./AuthError')
const Roles = require('./Roles')

const MissingFieldsError = newAuthError(
  'missing-fields',
  'api/fields/missing'
)

const getMissingFields = async ({ user, pgdb }) => {
  const missingFields = []

  const isMember = !!user && Roles.userHasRole(user, 'member')
  const hasNames = !!user && (
    user.firstName &&
    user.firstName.trim().length > 0 &&
    user.lastName &&
    user.lastName.trim().length > 0
  )
  const hasActiveMembership = !!user && (await hasUserActiveMembership(user, pgdb))

  if (user && isMember && hasActiveMembership && !hasNames) {
    missingFields.push('firstName')
    missingFields.push('lastName')
  }

  return missingFields
}

const ensureRequiredFields = async ({ user, email, providedFields, pgdb }) => {
  const missingFields = []
  const requiredFields = {}

  const expectedFields = await getMissingFields({ user, pgdb })

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
