const type = 'User'

module.exports = {
  type,
  name: type.toLowerCase(),
  path: 'public.users',
  search: {
    termFields: {
      name: {
        boost: 2,
        highlight: {
          number_of_fragments: 0,
        },
      },
      username: {
        highlight: {
          number_of_fragments: 0,
        },
      },
      biography: {
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300,
        },
      },
      statement: {
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300,
        },
      },
      'resolved.credential': {
        highlight: {
          number_of_fragments: 0,
        },
      },
    },
    filter: {
      default: () => ({
        bool: {
          must: [
            { term: { __type: type } },
            { term: { hasPublicProfile: true } },
          ],
        },
      }),
    },
  },
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        __type: {
          type: 'keyword',
        },
        __sort: {
          properties: {
            date: {
              type: 'date',
            },
          },
        },
        resolved: {
          properties: {
            credential: {
              type: 'text',
              analyzer: 'german',
            },
          },
        },

        biography: {
          type: 'text',
          analyzer: 'german',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },
        hasPublicProfile: {
          type: 'boolean',
        },
        name: {
          type: 'text',
        },
        statement: {
          type: 'text',
          analyzer: 'german',
        },
        username: {
          type: 'text',
        },
      },
    },
  },
}
