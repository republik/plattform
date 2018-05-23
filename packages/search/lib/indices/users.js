const type = 'User'

module.exports = {
  type,
  index: type.toLowerCase(),
  search: {
    termFields: {
      firstName: {
        highlight: {}
      },
      lastName: {
        highlight: {}
      },
      name: {
        highlight: {}
      },
      username: {
        highlight: {}
      },
      biography: {
        highlight: {}
      },
      statement: {
        highlight: {}
      },
      twitterHandle: {
        highlight: {}
      },
      facebookId: {
        highlight: {}
      }
    },
    filter: {
      bool: {
        must: [
          { term: { __type: type } },
          { term: { hasPublicProfile: true } },
          { term: { verified: true } }
        ]
      }
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
