jest.mock('@orbiting/backend-modules-auth', () => ({
  Roles: {
    userIsInRoles: jest.fn(),
  },
}))

const UUT = require('./process')

const getMdast = () => ({
  identifier: 'CENTER',
  data: {},
  children: [
    {
      children: [
        {
          type: 'text',
          value: 'Hello',
        },
      ],
      type: 'paragraph',
    },
    {
      identifier: 'IF',
      data: {
        present: 'hasAccess',
      },
      children: [
        {
          children: [
            {
              type: 'text',
              value: 'This ',
            },
            {
              children: [
                {
                  type: 'text',
                  value: 'part',
                },
              ],
              type: 'emphasis',
            },
            {
              type: 'text',
              value: ' is visible to ',
            },
            {
              children: [
                {
                  type: 'text',
                  value: 'users w/ access',
                },
              ],
              type: 'strong',
            },
            {
              type: 'text',
              value: '.',
            },
          ],
          type: 'paragraph',
        },
        {
          identifier: 'ELSE',
          data: {},
          children: [
            {
              children: [
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Users lacking access, will see this.',
                    },
                  ],
                  type: 'strong',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'zone',
        },
      ],
      type: 'zone',
    },
    {
      children: [
        {
          type: 'text',
          value: 'In between.',
        },
      ],
      type: 'paragraph',
    },
    {
      identifier: 'IF',
      data: {
        present: 'hasAccess',
      },
      children: [
        {
          children: [
            {
              type: 'text',
              value: 'Block only shows IF hasAccess === true',
            },
          ],
          type: 'paragraph',
        },
      ],
      type: 'zone',
    },
    {
      children: [
        {
          type: 'text',
          value: 'In between again.',
        },
      ],
      type: 'paragraph',
    },
    {
      identifier: 'IF',
      data: {
        present: 'hasAccess',
      },
      children: [
        {
          identifier: 'ELSE',
          data: {},
          children: [
            {
              children: [
                {
                  type: 'text',
                  value:
                    'Block visible to users w/o access in an empty IF hasAccess block.',
                },
              ],
              type: 'paragraph',
            },
          ],
          type: 'zone',
        },
      ],
      type: 'zone',
    },
    {
      children: [
        {
          type: 'text',
          value: 'Live long, and prosper.',
        },
      ],
      type: 'paragraph',
    },
  ],
  type: 'zone',
})

describe('process', () => {
  describe('processIfHasAccess', () => {
    it('keeps non-member nodes if user has no access', () => {
      const { Roles } = require('@orbiting/backend-modules-auth')
      Roles.userIsInRoles.mockReturnValue(false)

      const mdast = getMdast()

      UUT.processIfHasAccess(mdast)
      expect(mdast).toMatchSnapshot()
    })

    it('keeps member nodes if user has access', () => {
      const { Roles } = require('@orbiting/backend-modules-auth')
      Roles.userIsInRoles.mockReturnValue(true)

      const mdast = getMdast()
      UUT.processIfHasAccess(mdast)
      expect(mdast).toMatchSnapshot()
    })
  })
})
