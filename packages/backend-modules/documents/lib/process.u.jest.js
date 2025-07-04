jest.mock('@orbiting/backend-modules-auth', () => ({
  Roles: {
    userIsInRoles: jest.fn(),
  },
}))
jest.mock('./restrictions', () => ({
  hasFullDocumentAccess: jest.fn(),
}))

const UUT = require('./process')

const getMdast = () => ({
  children: [
    {
      identifier: 'FIGURE',
      data: {},
      children: [
        {
          children: [
            {
              alt: null,
              type: 'image',
              title: null,
              url: '',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [
                {
                  type: 'text',
                  value: 'P',
                },
              ],
              type: 'emphasis',
            },
          ],
          type: 'paragraph',
        },
      ],
      type: 'zone',
    },
    {
      identifier: 'CENTER',
      data: {},
      children: [
        {
          children: [
            {
              type: 'text',
              value: 'Paragraph 1',
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
                  value: 'If 2-1',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                {
                  type: 'text',
                  value: 'If 2-2',
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
                      type: 'text',
                      value: 'Else 2-1',
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Else 2-2',
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
              value: 'Paragraph 2',
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
                      value: 'Else 3-1',
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Else 3-2',
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Else 3-3',
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
          identifier: 'IF',
          data: {
            present: 'hasAccess',
          },
          children: [
            {
              children: [
                {
                  type: 'text',
                  value: 'If 4-1',
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
                      type: 'text',
                      value: 'Else 4-1',
                    },
                  ],
                  type: 'paragraph',
                },
                {
                  children: [
                    {
                      type: 'text',
                      value: 'Else 4-2',
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
                          value: 'If 5-1',
                        },
                      ],
                      type: 'paragraph',
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: 'If 5-2',
                        },
                      ],
                      type: 'paragraph',
                    },
                    {
                      children: [
                        {
                          type: 'text',
                          value: 'If 5-3',
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
                              type: 'text',
                              value: 'Else 5-1',
                            },
                          ],
                          type: 'paragraph',
                        },
                        {
                          children: [
                            {
                              type: 'text',
                              value: 'Else 5-2',
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
              value: 'Paragraph 6',
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
                  value: 'If 7-1',
                },
              ],
              type: 'paragraph',
            },
            {
              children: [
                {
                  type: 'text',
                  value: 'If 7-2',
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
              value: 'Paragraph 8',
            },
          ],
          type: 'paragraph',
        },
      ],
      type: 'zone',
    },
  ],
  type: 'root',
})

describe('process', () => {
  describe('processIfHasAccess', () => {
    it('keeps non-member nodes if user has no access', () => {
      const { hasFullDocumentAccess } = require('./restrictions')
      hasFullDocumentAccess.mockReturnValue(false)

      const mdast = getMdast()

      UUT.processIfHasAccess(mdast)
      expect(mdast).toMatchSnapshot()
    })

    it('keeps member nodes if user has access', () => {
      const { hasFullDocumentAccess } = require('./restrictions')
      hasFullDocumentAccess.mockReturnValue(true)

      const mdast = getMdast()
      UUT.processIfHasAccess(mdast)
      expect(mdast).toMatchSnapshot()
    })
  })
})
