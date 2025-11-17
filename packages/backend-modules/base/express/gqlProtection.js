const { print, Kind } = require('graphql')
const { ApolloArmor } = require('@escape.tech/graphql-armor')
const { logger: baseLogger } = require('@orbiting/backend-modules-logger')

const validationLogger = baseLogger.child({}, { msgPrefix: '[Graphql Armor] ' })

function createRejectLogger(name) {
  return function (ctx, error) {
    const doc = ctx?.getDocument() ? print(ctx?.getDocument()) : null

    validationLogger.error(
      {
        rule: name,
        doc: doc,
        error,
      },
      'request rejected',
    )
  }
}

function createAcceptLogger(name) {
  return function (ctx, details) {
    const doc = ctx?.getDocument()

    const operationDef = doc?.definitions?.find(
      (def) => def.kind === Kind.OPERATION_DEFINITION,
    )

    const operation = operationDef.name
      ? operationDef.name.value
      : doc
      ? print(doc)
      : null

    validationLogger.info(
      { rule: name, value: details.n, operation },
      'request accepted',
    )
  }
}

const gqlArmor = new ApolloArmor({
  maxAliases: {
    enabled: true,
    n: 5,
    onReject: [createRejectLogger('maxAliases')],
  },
  maxDepth: {
    enabled: true,
    n: 20,
    onAccept: [createAcceptLogger('maxDepth')],
    onReject: [createRejectLogger('maxDepth')],
  },
  costLimit: {
    enabled: true,
    maxCost: 100000,
    onAccept: [createAcceptLogger('costLimit')],
    onReject: [createRejectLogger('costLimit')],
  },
  blockFieldSuggestion: {
    enabled: false,
  },
})

const gqlProtection = gqlArmor.protect()

exports.gqlProtection = gqlProtection
