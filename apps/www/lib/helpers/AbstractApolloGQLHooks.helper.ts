import {
  ApolloCache,
  DefaultContext,
  DocumentNode,
  MutationHookOptions,
  MutationTuple,
  OperationVariables,
  QueryHookOptions,
  QueryResult,
  TypedDocumentNode,
  useMutation,
  useQuery,
} from '@apollo/client'

/**
 * Create a new useQuery-like hook that abstracts the graphql query.
 * @param query that should be abstracted in the new hook
 */
export function makeQueryHook<TData = any, TVariables = OperationVariables>(
  query: DocumentNode | TypedDocumentNode<TData, TVariables>,
) {
  return (
    options?: QueryHookOptions<TData, TVariables>,
  ): QueryResult<TData, TVariables> =>
    useQuery<TData, TVariables>(query, options)
}

/**
 * Create a new useMutation-like hook that abstracts the graphql mutation.
 * @param mutation that should be abstracted in the new hook
 */
export function makeMutationHook<
  TData = any,
  TVariables = OperationVariables,
  TContext = DefaultContext,
  TCache extends ApolloCache<any> = ApolloCache<any>,
>(mutation: DocumentNode | TypedDocumentNode<TData, TVariables>) {
  return (
    options?: MutationHookOptions<TData, TVariables, TContext>,
  ): MutationTuple<TData, TVariables, TContext, TCache> =>
    useMutation<TData, TVariables, TContext, TCache>(mutation, options)
}
