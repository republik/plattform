const graphqlTools = require('graphql-tools')
const Roles = require('../../../lib/Roles')

module.exports = async (_, args, { user }) => {
  if (!user.private || Roles.userHasRole(user, 'supporter') || Roles.userHasRole(user, 'admin')) {
    const email = user.isEmailPublic
      ? user.email
      : null
    // TODO: Replace mocks with actual data.
    return {
      ...user,
      email,
      testimonial: {
        id: '58ef3a0d-82c1-4ead-add5-ec08f6f0d75f',
        name: 'Daniel Pfänder',
        quote: 'Journalismus heißt, etwas zu drucken, von dem jemand will, dass es nicht gedruckt wird. Alles andere ist Public Relations.',
        role: 'Entwickler',
        image: 'https://assets.republik.ch/testimonials/58ef3a0d-82c1-4ead-add5-ec08f6f0d75f_384x384.jpeg',
        sequenceNumber: 754
      },
      badges: () => new graphqlTools.MockList([0, 5]),
      latestComments: () => new graphqlTools.MockList([20, 50])
    }
  }
}
