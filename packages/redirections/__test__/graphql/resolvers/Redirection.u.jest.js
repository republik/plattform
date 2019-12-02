jest.mock(
  '@orbiting/backend-modules-auth',
  () => ({
    Roles: {
      userIsInRoles: jest.fn()
    }
  })
)

const Redirection = require('../../../graphql/resolvers/Redirection')
const { DEFAULT_ROLES } = require('../../../lib/Redirections')

const base = 'http://localhost'

describe('target()', () => {
  test('/a returns /b', () => {
    const { target } = Redirection

    const redirection = {
      source: '/a',
      target: '/b',
      __pathUrl: new URL('/a', base)
    }

    expect(target(redirection)).toEqual('/b')
  })

  test('/a returns /b?p=1', () => {
    const { target } = Redirection

    const redirection = {
      source: '/a',
      target: '/b?p=1',
      __pathUrl: new URL('/a', base)
    }

    expect(target(redirection)).toEqual('/b?p=1')
  })

  describe('{ keepQuery: false }', () => {
    test('/a?p=2 returns /b?p=1', () => {
      const { target } = Redirection

      const redirection = {
        source: '/a',
        target: '/b?p=1',
        keepQuery: false,
        __pathUrl: new URL('/a?p=2', base)
      }

      expect(target(redirection)).toEqual('/b?p=1')
    })

    test('/a?p=2&m=n returns /b?p=1', () => {
      const { target } = Redirection

      const redirection = {
        source: '/a',
        target: '/b?p=1',
        keepQuery: false,
        __pathUrl: new URL('/a?p=2&m=n', base)
      }

      expect(target(redirection)).toEqual('/b?p=1')
    })
  })

  describe('{ keepQuery: true }', () => {
    test('/a?p=2 returns /b?p=2', () => {
      const { target } = Redirection

      const redirection = {
        source: '/a',
        target: '/b?p=1',
        keepQuery: true,
        __pathUrl: new URL('/a?p=2', base)
      }

      expect(target(redirection)).toEqual('/b?p=2')
    })

    test('/a?p=2&m=n returns /b?p=2&m=n', () => {
      const { target } = Redirection

      const redirection = {
        source: '/a',
        target: '/b?p=1',
        keepQuery: true,
        __pathUrl: new URL('/a?p=2&m=n', base)
      }

      expect(target(redirection)).toEqual('/b?p=2&m=n')
    })

    test('/a?m=n returns /b?p=1&m=n', () => {
      const { target } = Redirection

      const redirection = {
        source: '/a',
        target: '/b?p=1',
        keepQuery: true,
        __pathUrl: new URL('/a?p=1&m=n', base)
      }

      expect(target(redirection)).toEqual('/b?p=1&m=n')
    })

    test('/a#h1 returns /b?p=1', () => {
      const { target } = Redirection

      const redirection = {
        source: '/a',
        target: '/b?p=1',
        keepQuery: true,
        __pathUrl: new URL('/a#h1', base)
      }

      expect(target(redirection)).toEqual('/b?p=1')
    })
  })
})

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

    expect(Roles.userIsInRoles).toHaveBeenCalledWith(expectedUser, DEFAULT_ROLES)
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

    expect(Roles.userIsInRoles).toHaveBeenCalledWith(expectedUser, DEFAULT_ROLES)
    expect(result).toBeNull()
  })
})
