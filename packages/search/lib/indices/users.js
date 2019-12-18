const type = 'User'

module.exports = {
  type,
  name: type.toLowerCase(),
  search: {
    termFields: {
      name: {
        boost: 2,
        highlight: {
          number_of_fragments: 0
        }
      },
      username: {
        highlight: {
          number_of_fragments: 0
        }
      },
      biography: {
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300
        }
      },
      statement: {
        highlight: {
          boundary_scanner_locale: 'de-CH',
          fragment_size: 300
        }
      },
      'resolved.credential': {
        highlight: {
          number_of_fragments: 0
        }
      }
    },
    filter: {
      default: () => ({
        bool: {
          must: [
            { term: { __type: type } },
            { term: { hasPublicProfile: true } }
          ]
        }
      })
    }
  },
  mapping: {
    [type]: {
      dynamic: false,
      properties: {
        __type: {
          type: 'keyword'
        },
        __sort: {
          properties: {
            date: {
              type: 'date'
            }
          }
        },
        resolved: {
          properties: {
            credential: {
              type: 'text',
              analyzer: 'german'
            }
          }
        },

        addressId: {
          type: 'keyword'
        },
        adminNotes: {
          type: 'text',
          analyzer: 'german'
        },
        ageAccessRole: {
          type: 'keyword'
        },
        biography: {
          type: 'text',
          analyzer: 'german',
          fields: {
            keyword: {
              type: 'keyword',
              ignore_above: 256
            }
          }
        },
        birthday: {
          type: 'date'
        },
        createdAt: {
          type: 'date'
        },
        defaultDiscussionNotificationOption: {
          type: 'keyword'
        },
        discussionNotificationChannels: {
          type: 'keyword'
        },
        email: {
          type: 'keyword'
        },
        emailAccessRole: {
          type: 'keyword'
        },
        facebookId: {
          type: 'keyword'
        },
        firstName: {
          type: 'text'
        },
        hasPublicProfile: {
          type: 'boolean'
        },
        id: {
          type: 'keyword'
        },
        isAdminUnlisted: {
          type: 'boolean'
        },
        isListed: {
          type: 'boolean'
        },
        lastName: {
          type: 'text'
        },
        name: {
          type: 'text'
        },
        pgpPublicKey: {
          type: 'text'
        },
        phoneNumber: {
          type: 'keyword'
        },
        phoneNumberAccessRole: {
          type: 'keyword'
        },
        phoneNumberNote: {
          type: 'text',
          analyzer: 'german'
        },
        portraitUrl: {
          type: 'keyword'
        },
        previewsSentAt: {
          type: 'date'
        },
        publicUrl: {
          type: 'keyword'
        },
        roles: {
          type: 'keyword'
        },
        statement: {
          type: 'text',
          analyzer: 'german'
        },
        testimonialId: {
          type: 'keyword'
        },
        twitterHandle: {
          type: 'keyword'
        },
        updatedAt: {
          type: 'date'
        },
        username: {
          type: 'text'
        },
        verified: {
          type: 'boolean'
        }
      }
    }
  }
}
