import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import * as InfiniteScroller from 'react-infinite-scroller'
import { css, StyleAttribute } from 'glamor'
import { PostfinancePayment } from '../../../types/admin'
import * as DateRange from '../../Form/DateRange'
import * as Bool from '../../Form/Boolean'

import TableForm from './TableForm'
import TableHead from './TableHead'
import TableBody from './TableBody'

import {
  SortOptions,
  SortDirection,
  serializeOrderBy,
  deserializeOrderBy
} from '../../../lib/utils/queryParams'

export interface PostfinancePaymentsResult {
  postfinancePayments: {
    items: PostfinancePayment[]
    count: number
  }
}

export interface PostfinancePaymentTableParams {
  orderBy?: string
  search?: string
  dateRange?: string
}

interface OwnProps {
  [prop: string]: any
  loadMorePayments?: any
  params: any
  onChange: (...args: any[]) => void
}

interface Props extends OwnProps {
  data: QueryProps & PostfinancePaymentsResult
}

const PAYMENTS_LIMIT = 200

const identity = (v: any) => v

const createChangeHandler = (
  params: any,
  handler: (v: any) => void
) => (fieldName: string, serializer?: any) => (
  value: any
) => {
  const s = serializer || identity
  if (value && value !== '') {
    handler({
      ...params,
      ...{ [fieldName]: s(value) }
    })
  } else {
    delete params[fieldName]
    handler(params)
  }
}

const Payments = (props: Props) => {
  if (!props.data.postfinancePayments) {
    return <div>Loading</div>
  }
  const {
    data: {
      postfinancePayments: { items, count },
      loading
    },
    params,
    loadMorePayments,
    onChange
  } = props

  const changeHandler = createChangeHandler(
    params,
    onChange
  )

  return (
    <InfiniteScroller
      loadMore={loadMorePayments}
      hasMore={count > items.length}
      useWindow={false}
    >
      <div>
        <TableForm
          search={params.search}
          onSearch={changeHandler('search')}
          dateRange={DateRange.parse(params.dateRange)}
          onDateRange={changeHandler(
            'dateRange',
            DateRange.serialize
          )}
          bool={Bool.parse(params.bool)}
          onBool={changeHandler('bool', Bool.serialize)}
        />
        <TableHead
          sort={deserializeOrderBy(params.orderBy)}
          onSort={changeHandler(
            'orderBy',
            serializeOrderBy
          )}
        />
        <TableBody items={items} />
      </div>
    </InfiniteScroller>
  )
}

const postfinancePaymentsQuery = gql`
  query postfinancePayments(
    $limit: Int!
    $offset: Int
    $orderBy: OrderBy
    $dateRange: DateRangeFilter
    $search: String
    $bool: BooleanFilter
  ) {
    postfinancePayments(
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      dateRangeFilter: $dateRange
      search: $search
      booleanFilter: $bool
    ) {
      count
      items {
        id
        buchungsdatum
        valuta
        avisierungstext
        gutschrift
        mitteilung
        matched
        createdAt
        updatedAt
      }
    }
  }
`

export default graphql(postfinancePaymentsQuery, {
  options: ({
    params: { orderBy, search, dateRange, bool }
  }: OwnProps) => {
    return {
      variables: {
        limit: PAYMENTS_LIMIT,
        offset: 0,
        orderBy: deserializeOrderBy(orderBy),
        dateRange: DateRange.parse(dateRange),
        bool: Bool.parse(bool),
        search
      }
    }
  },
  props: ({
    data
  }: OptionProps<OwnProps, PostfinancePaymentsResult>) => ({
    data,
    loadMorePayments: () => {
      if (!data) {
        throw new Error('data object undefined')
      }
      return data.fetchMore({
        variables: {
          offset: data.postfinancePayments.items.length
        },
        updateQuery: (
          previousResult: PostfinancePaymentsResult,
          { fetchMoreResult }
        ) => {
          if (!fetchMoreResult) {
            return previousResult
          }
          return {
            ...previousResult,
            ...{
              postfinancePayments: {
                items: [
                  ...previousResult.postfinancePayments
                    .items,
                  ...(fetchMoreResult as PostfinancePaymentsResult)
                    .postfinancePayments.items
                ]
              }
            }
          }
        }
      })
    }
  })
})(Payments)
