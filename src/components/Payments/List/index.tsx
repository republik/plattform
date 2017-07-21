import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import * as InfiniteScroller from 'react-infinite-scroller'
import { css, StyleAttribute } from 'glamor'
import { PledgePayment } from '../../../types/admin'

import TableForm from './TableForm'
import TableHead from './TableHead'
import TableBody from './TableBody'

import * as DateRange from '../../Form/DateRange'
import * as StringArray from '../../Form/StringArray'

import {
  SortOptions,
  SortDirection,
  serializeOrderBy,
  deserializeOrderBy
} from '../../../lib/utils/queryParams'

export interface PaymentsResult {
  payments: {
    items: PledgePayment[]
    count: number
  }
}

export interface PaymentTableParams {
  orderBy?: string
  dateRange?: string
  stringArray?: string
  search?: string
}

interface OwnProps {
  [prop: string]: any
  loadMorePayments?: any
  params: any
  onChange: (...args: any[]) => void
}

interface Props extends OwnProps {
  data: QueryProps & PaymentsResult
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
  if (!props.data.payments) {
    return <div>Loading</div>
  }
  const {
    data: { payments: { items, count }, loading },
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
          stringArray={StringArray.parse(
            params.stringArray
          )}
          onStringArray={changeHandler(
            'stringArray',
            StringArray.serialize
          )}
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

const paymentsQuery = gql`
  query payments(
    $limit: Int!
    $offset: Int
    $orderBy: OrderBy
    $search: String
    $dateRange: DateRangeFilter
    $stringArray: StringArrayFilter
  ) {
    payments(
      limit: $limit
      offset: $offset
      orderBy: $orderBy
      dateRangeFilter: $dateRange
      stringArrayFilter: $stringArray
      search: $search
    ) {
      count
      items {
        id
        method
        dueDate
        paperInvoice
        total
        status
        hrid
        createdAt
        updatedAt
      }
    }
  }
`

export default graphql(paymentsQuery, {
  options: ({
    params: { orderBy, search, dateRange, stringArray }
  }: OwnProps) => {
    return {
      variables: {
        limit: PAYMENTS_LIMIT,
        offset: 0,
        orderBy: deserializeOrderBy(orderBy),
        dateRange: DateRange.parse(dateRange),
        stringArray: StringArray.parse(stringArray),
        search
      }
    }
  },
  props: ({
    data
  }: OptionProps<OwnProps, PaymentsResult>) => ({
    data,
    loadMorePayments: () => {
      if (!data) {
        throw new Error('data object undefined')
      }
      return data.fetchMore({
        variables: {
          offset: data.payments.items.length
        },
        updateQuery: (
          previousResult: PaymentsResult,
          { fetchMoreResult }
        ) => {
          if (!fetchMoreResult) {
            return previousResult
          }
          return {
            ...previousResult,
            ...{
              payments: {
                items: [
                  ...previousResult.payments.items,
                  ...(fetchMoreResult as PaymentsResult)
                    .payments.items
                ]
              }
            }
          }
        }
      })
    }
  })
})(Payments)
