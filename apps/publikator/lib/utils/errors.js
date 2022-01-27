export const errorToString = error =>
  error.graphQLErrors && error.graphQLErrors.length
    ? error.graphQLErrors.map(e => e.message).join(', ')
    : error.toString()
