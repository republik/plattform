const graphqlTools = require('graphql-tools')

module.exports = async (_, args, { user }) => {
  // TODO: Replace mocks with actual data.
  return {
    id: args.id,
    publicEmail: 'foo@republik.ch',
    publicUrl: 'http://www.republik.ch',
    twitterHandle: 'foo',
    facebookId: 'foo',
    testimonial: {
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
