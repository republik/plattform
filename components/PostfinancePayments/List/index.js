import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { compose } from 'redux'
import InfiniteScroller from 'react-infinite-scroller'
import DateRange from '../../Form/DateRange'
import Bool from '../../Form/Boolean'
import ErrorMessage from '../../ErrorMessage'

import TableForm from './TableForm'
import TableHead from './TableHead'
import TableBody from './TableBody'

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

const getInitialState = () => ({
  error: false,
  feedback: false
})

class PostfinancePayments extends Component {
  constructor(props) {
    super(props)
    this.state = getInitialState(props)
  }

  uploadHandler = ({ csv }) => {
    this.props
      .uploadCSV({ csv })
      .then(v =>
        this.setState(() => ({
          ...this.state,
          feedback: v.data.importPostfinanceCSV
        }))
      )
      .catch(e =>
        this.setState(() => ({
          ...this.state,
          error: e
        }))
      )
  }

  rematchHandler = () => {
    this.props
      .rematchPayments()
      .then(v =>
        this.setState(() => ({
          ...this.state,
          feedback: v.data.rematchPayments
        }))
      )
      .catch(e =>
        this.setState(() => ({
          ...this.state,
          error: e
        }))
      )
  }

  componentWillReceiveProps(nextProps) {
    this.state = getInitialState(nextProps)
  }

  render() {
    const props = this.props
    const renderErrors = () => {
      if (props.data.error || this.state.error) {
        return (
          <div>
            {props.data.error && (
              <ErrorMessage error={props.data.error} />
            )}
            {this.state.error && (
              <ErrorMessage error={this.state.error} />
            )}
          </div>
        )
      }
    }

    const {
      data: { postfinancePayments },
      params,
      loadMorePayments,
      updatePostfinancePayment,
      hidePostfinancePayment,
      manuallyMatchPostfinancePayment,
      onChange
    } = props

    const changeHandler = createChangeHandler(
      params,
      onChange
    )

    if (!props.data.postfinancePayments) {
      return <div>Loading</div>
    }
    const { items, count } = postfinancePayments
    return (
      <InfiniteScroller
        loadMore={loadMorePayments}
        hasMore={count > items.length}
        useWindow={false}
      >
        <div>
          {renderErrors()}
          {this.state.feedback && (
            <div>{this.state.feedback}</div>
          )}
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
            onUpload={this.uploadHandler}
            onRematch={this.rematchHandler}
          />
          <TableHead
            sort={deserializeOrderBy(params.orderBy)}
            onSort={changeHandler(
              'orderBy',
              serializeOrderBy
            )}
          />
          <TableBody
            items={props.data.postfinancePayments.items}
            onMessage={updatePostfinancePayment}
            onHide={hidePostfinancePayment}
            onMatch={manuallyMatchPostfinancePayment}
          />
        </div>
      </InfiniteScroller>
    )
  }
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
        hidden
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

const updatePostfinancePaymentMutation = gql`
  mutation updatePostfinancePayment(
    $id: ID!
    $message: String!
  ) {
    updatePostfinancePayment(
      pfpId: $id
      mitteilung: $message
    ) {
      id
      hidden
    }
  }
`

const uploadMutation = gql`
  mutation importPostfinanceCSV($csv: String!) {
    importPostfinanceCSV(csv: $csv)
  }
`

const rematchMutation = gql`
  mutation rematchPayments {
    rematchPayments
  }
`

const hidePostfinancePaymentMutation = gql`
  mutation hidePostfinancePayment($id: ID!) {
    hidePostfinancePayment(id: $id) {
      id
      hidden
    }
  }
`

const manuallyMatchPostfinancePaymentMutation = gql`
  mutation manuallyMatchPostfinancePayment($id: ID!) {
    manuallyMatchPostfinancePayment(id: $id) {
      id
      hidden
    }
  }
`

export default compose(
  graphql(postfinancePaymentsQuery, {
    options: ({
      params: { orderBy, search, dateRange, bool }
    }) => {
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
    props: ({ data }) => {
      return {
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
              previousResult,
              { fetchMoreResult }
            ) => {
              if (!fetchMoreResult) {
                return previousResult
              }
              return {
                ...previousResult,
                ...{
                  postfinancePayments: {
                    ...previousResult.postfinancePayments,
                    ...fetchMoreResult,
                    items: [
                      ...previousResult.postfinancePayments
                        .items,
                      ...fetchMoreResult.postfinancePayments
                        .items
                    ]
                  }
                }
              }
            }
          })
        }
      }
    }
  }),
  graphql(updatePostfinancePaymentMutation, {
    props: ({
      mutate,
      ownProps: {
        params: { orderBy, search, dateRange, bool }
      }
    }) => ({
      updatePostfinancePayment: ({ id, message }) => {
        if (mutate) {
          return mutate({
            variables: { id, message },
            refetchQueries: [
              {
                query: postfinancePaymentsQuery,
                variables: {
                  limit: PAYMENTS_LIMIT,
                  offset: 0,
                  orderBy: deserializeOrderBy(orderBy),
                  dateRange: DateRange.parse(dateRange),
                  bool: Bool.parse(bool),
                  search
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(uploadMutation, {
    props: ({ mutate }) => ({
      uploadCSV: ({ csv }) => {
        if (mutate) {
          return mutate({
            variables: { csv }
          })
        }
      }
    })
  }),
  graphql(hidePostfinancePaymentMutation, {
    props: ({
      mutate,
      ownProps: {
        params: { orderBy, search, dateRange, bool }
      }
    }) => ({
      hidePostfinancePayment: ({ id }) => {
        if (mutate) {
          return mutate({
            variables: { id },
            refetchQueries: [
              {
                query: postfinancePaymentsQuery,
                variables: {
                  limit: PAYMENTS_LIMIT,
                  offset: 0,
                  orderBy: deserializeOrderBy(orderBy),
                  dateRange: DateRange.parse(dateRange),
                  bool: Bool.parse(bool),
                  search
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(manuallyMatchPostfinancePaymentMutation, {
    props: ({
      mutate,
      ownProps: {
        params: { orderBy, search, dateRange, bool }
      }
    }) => ({
      manuallyMatchPostfinancePayment: ({ id }) => {
        if (mutate) {
          return mutate({
            variables: { id },
            refetchQueries: [
              {
                query: postfinancePaymentsQuery,
                variables: {
                  limit: PAYMENTS_LIMIT,
                  offset: 0,
                  orderBy: deserializeOrderBy(orderBy),
                  dateRange: DateRange.parse(dateRange),
                  bool: Bool.parse(bool),
                  search
                }
              }
            ]
          })
        }
      }
    })
  }),
  graphql(rematchMutation, {
    props: ({
      mutate,
      ownProps: {
        params: { orderBy, search, dateRange, bool }
      }
    }) => ({
      rematchPayments: () => {
        if (mutate) {
          return mutate({
            refetchQueries: [
              {
                query: postfinancePaymentsQuery,
                variables: {
                  limit: PAYMENTS_LIMIT,
                  offset: 0,
                  orderBy: deserializeOrderBy(orderBy),
                  dateRange: DateRange.parse(dateRange),
                  bool: Bool.parse(bool),
                  search
                }
              }
            ]
          })
        }
      }
    })
  })
)(PostfinancePayments)
