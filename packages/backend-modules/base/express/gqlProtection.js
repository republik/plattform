const { print, Kind } = require('graphql')
const { ApolloArmor } = require('@escape.tech/graphql-armor')
const { logger: baseLogger } = require('@orbiting/backend-modules-logger')

const validationLogger = baseLogger.child({}, { msgPrefix: '[Graphql Armor] ' })

function getOperation(ctx) {
  const doc = ctx?.getDocument()

  const operationDef = doc?.definitions?.find(
    (def) => def.kind === Kind.OPERATION_DEFINITION,
  )

  if (!operationDef) {
    return 'Unknown operation'
  }

  const operation = operationDef?.name?.value || 'Unknown operation'

  return operation
}

function createRejectLogger(name) {
  return function (ctx, error) {
    const doc = ctx?.getDocument() ? print(ctx?.getDocument()) : null
    const operation = getOperation(ctx)

    validationLogger.error(
      {
        rule: name,
        operation: operation,
        doc: doc,
        error,
      },
      `rule: [${name}] operation: [${operation}] request rejected`,
    )
  }
}

function createAcceptLogger(name) {
  return function (ctx, details) {
    const operation = getOperation(ctx)

    validationLogger.debug(
      { rule: name, value: details.n, operation },
      `rule: [${name}] operation: [${operation}] request accepted`,
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
  maxDirectives: {
    enabled: true,
    n: 50,
    onReject: [createRejectLogger('maxDirectives')],
  },
  maxTokens: {
    enabled: true,
    n: 1000,
    onReject: [createRejectLogger('maxTokens')],
  },
  blockFieldSuggestion: {
    enabled: false,
  },
})

const gqlProtection = gqlArmor.protect()

exports.gqlProtection = gqlProtection
