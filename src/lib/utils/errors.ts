export const errorToString = (error: any) =>
  error.graphQLErrors && error.graphQLErrors.length
    ? error.graphQLErrors
        .map((e: any) => e.message)
        .join(', ')
    : error.toString()
