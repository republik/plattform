import React from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import ErrorMessage from '../../ErrorMessage'
import InfiniteScroller from 'react-infinite-scroller'

import TableForm from './TableForm'
import TableHead from './TableHead'
import TableBody from './TableBody'

import DateRange from '../../Form/DateRange'
import StringArray from '../../Form/StringArray'

import {
  serializeOrderBy,
  deserializeOrderBy
} from '../../../lib/utils/queryParams'

const PAYMENTS_LIMIT = 200

const identity = v => v

const createChangeHandler = (params, handler) => (
  fieldName: string,
  serializer?
) => value => {
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

const Payments = props => {
  if (props.data.error) {
    return (
      <ErrorMessage error={props.data.error} />
    )
  } else if (!props.data.payments) {
    return <div>Loading</div>
  }
  const {
    data: { payments: { items, count } },
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
          companyName={params.companyName}
          onSearch={changeHandler('search')}
          onSelectCompany={changeHandler(
            'companyName'
          )}
          dateRange={DateRange.parse(
            params.dateRange
          )}
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
          sort={deserializeOrderBy(
            params.orderBy
          )}
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
        user {
          id
        }
        createdAt
        updatedAt
      }
    }
  }
`

export default graphql(paymentsQuery, {
  options: ({
    params: {
      orderBy,
      search,
      dateRange,
      stringArray
    }
  }) => {
    return {
      variables: {
        limit: PAYMENTS_LIMIT,
        offset: 0,
        orderBy: deserializeOrderBy(orderBy),
        dateRange: DateRange.parse(dateRange),
        stringArray: StringArray.parse(
          stringArray
        ),
        search
      }
    }
  },
  props: ({ data }) => ({
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
          previousResult,
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
                  ...previousResult.payments
                    .items,
                  ...fetchMoreResult.payments
                    .items
                ]
              }
            }
          }
        }
      })
    }
  })
})(Payments)
