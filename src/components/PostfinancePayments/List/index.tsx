import * as React from 'react'
import {
  gql,
  graphql,
  OptionProps,
  QueryProps
} from 'react-apollo'
import { compose } from 'redux'
import { colors } from '@project-r/styleguide'
import * as InfiniteScroller from 'react-infinite-scroller'
import { css, StyleAttribute } from 'glamor'
import { PostfinancePayment } from '../../../types/admin'
import * as DateRange from '../../Form/DateRange'
import * as Bool from '../../Form/Boolean'
import ErrorMessage from '../../ErrorMessage'

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

interface State {
  error?: any
  feedback?: any
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

const getInitialState = (props: Props): State => ({
  error: false,
  feedback: false
})

class PostfinancePayments extends React.Component<
  Props,
  any
> {
  constructor(props: Props) {
    super(props)
    this.state = getInitialState(props)
  }

  public uploadHandler = ({ csv }: any) => {
    this.props
      .uploadCSV({ csv })
      .then((v: any) =>
        this.setState(() => ({
          ...this.state,
          feedback: v.data.importPostfinanceCSV
        }))
      )
      .catch((e: any) =>
        this.setState(() => ({
          ...this.state,
          error: e
        }))
      )
  }

  public rematchHandler = () => {
    this.props
      .rematchPayments()
      .then((v: any) =>
        this.setState(() => ({
          ...this.state,
          feedback: v.data.rematchPayments
        }))
      )
      .catch((e: any) =>
        this.setState(() => ({
          ...this.state,
          error: e
        }))
      )
  }

  public componentWillReceiveProps(nextProps: Props) {
    this.state = getInitialState(nextProps)
  }

  public render() {
    const props = this.props
    const renderErrors = () => {
      if (props.data.error || this.state.error) {
        return (
          <div>
            {props.data.error &&
              <ErrorMessage error={props.data.error} />}
            {this.state.error &&
              <ErrorMessage error={this.state.error} />}
          </div>
        )
      }
    }

    const {
      data: {
        postfinancePayments: { items, count },
        loading
      },
      params,
      loadMorePayments,
      uploadCSV,
      rematchPayments,
      updatePostfinancePayment,
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
          {renderErrors()}
          {this.state.feedback &&
            <div>
              {this.state.feedback}
            </div>}
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
          {props.data.postfinancePayments
            ? <TableBody
                items={props.data.postfinancePayments.items}
                onMessage={updatePostfinancePayment}
              />
            : <div>Loading</div>}
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

export default compose(
  graphql(postfinancePaymentsQuery, {
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
    }: OptionProps<
      OwnProps,
      PostfinancePaymentsResult
    >) => ({
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
  }),
  graphql(updatePostfinancePaymentMutation, {
    props: ({
      mutate,
      ownProps: {
        params: { orderBy, search, dateRange, bool }
      }
    }: any) => ({
      updatePostfinancePayment: ({ id, message }: any) => {
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
      uploadCSV: ({ csv }: any) => {
        if (mutate) {
          return mutate({
            variables: { csv }
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
