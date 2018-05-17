module.exports = {
  User: {
    dynamic: false,
    properties: {
      __type: {
        type: 'keyword'
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
        analyzer: 'german'
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
