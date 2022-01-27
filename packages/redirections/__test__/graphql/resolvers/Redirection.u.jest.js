jest.mock('@orbiting/backend-modules-auth', () => ({
  Roles: {
    userIsInRoles: jest.fn(),
  },
}))

const Redirection = require('../../../graphql/resolvers/Redirection')
const { DEFAULT_ROLES } = require('../../../lib/Redirections')

const base = 'http://localhost'

describe('resource()', () => {
  beforeEach(() => {
    const { Roles } = require('@orbiting/backend-modules-auth')
    Roles.userIsInRoles.mockReset()
  })

  test('returns resource if user has a valid role', () => {
    const { Roles } = require('@orbiting/backend-modules-auth')
    const { resource } = Redirection

    Roles.userIsInRoles.mockReturnValueOnce(true)

    const expectedUser = Symbol('A user')
    const expectedResource = Symbol('A resource')

    const redirection = { resource: expectedResource }

    const result = resource(redirection, null, { user: expectedUser })

    expect(Roles.userIsInRoles).toHaveBeenCalledWith(
      expectedUser,
      DEFAULT_ROLES,
    )
    expect(result).toEqual(expectedResource)
  })

  test('returns null if user has not a valid role', () => {
    const { Roles } = require('@orbiting/backend-modules-auth')
    const { resource } = Redirection

    Roles.userIsInRoles.mockReturnValueOnce(false)

    const expectedUser = Symbol('A user')
    const expectedResource = Symbol('A resource')

    const redirection = { resource: expectedResource }

    const result = resource(redirection, null, { user: expectedUser })

    expect(Roles.userIsInRoles).toHaveBeenCalledWith(
      expectedUser,
      DEFAULT_ROLES,
    )
    expect(result).toBeNull()
  })
})
