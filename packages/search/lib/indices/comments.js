const type = 'Comment'

module.exports = {
  type,
  name: type.toLowerCase(),
  path: 'public.comments',
  search: {
    termFields: {
      contentString: {
        boost: 0.5,
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300,
        },
      },
      'resolved.user.name': {
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
            { term: { published: true } },
            { term: { adminUnpublished: false } },
            { term: { 'resolved.discussion.hidden': false } },
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
            user: {
              properties: {
                name: {
                  type: 'text',
                },
              },
            },
            discussion: {
              properties: {
                hidden: {
                  type: 'boolean',
                },
              },
            },
          },
        },

        contentString: {
          type: 'text',
          analyzer: 'german',
          fielddata: true,
          fields: {
            count: {
              type: 'token_count',
              analyzer: 'standard',
              store: true,
            },
            keyword: {
              type: 'keyword',
              ignore_above: 256,
            },
          },
        },

        published: {
          type: 'boolean',
        },
        adminUnpublished: {
          type: 'boolean',
        },
      },
    },
  },
}
