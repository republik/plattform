const { ApolloArmor } = require('@escape.tech/graphql-armor')
const { logger: baseLogger } = require('@orbiting/backend-modules-logger')

const validationLogger = baseLogger.child({}, { msgPrefix: '[Graphql Armor] ' })

function logRejection(_ctx, error) {
  validationLogger.error({ error })
}
function logAccept(ctx, details) {
  validationLogger.info({ details })
}

const gqlArmor = new ApolloArmor({
  maxAliases: {
    enabled: true,
    n: 5,
    onReject: [logRejection],
  },
  maxDepth: {
    enabled: true,
    n: 20,
    onAccept: [logAccept],
    onReject: [logRejection],
  },
  costLimit: {
    enabled: true,
    limit: 10000,
    onAccept: [logAccept],
    onReject: [logRejection],
  },
  blockFieldSuggestion: {
    enabled: false,
    onReject: [logRejection],
  },
})

const gqlProtection = gqlArmor.protect()

exports.gqlProtection = gqlProtection
