import { Component } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import Head from 'next/head'
import { withRouter } from 'next/router'

import Loader from '../Loader'

const styles = {
  img: css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
  }),
}

class Image extends Component {
  tick() {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.next()
      this.tick()
    }, this.props.duration)
  }
  next() {
    const { statement, query, error, router } = this.props
    if (error && !query.sequenceNumber) {
      console.error(error)
      return
    }
    const to = {
      pathname: '/community',
      query: {
        ...query,
        sequenceNumber: error
          ? undefined
          : statement && statement.sequenceNumber,
      },
    }
    router.push(to, to, { shallow: router.pathname === '/community' })
  }
  componentDidMount() {
    this.tick()
  }
  componentWillUnmount() {
    clearTimeout(this.timeout)
  }
  render() {
    const { statement } = this.props

    return (
      <div>
        <Head>
          <meta name='robots' content='noindex' />
        </Head>
        <Loader
          loading={!statement}
          render={() => (
            <img
              {...styles.img}
              onDoubleClick={() => {
                this.next()
                this.tick()
              }}
              src={statement.portrait}
              alt={`${statement.sequenceNumber} – ${statement.name}`}
            />
          )}
        />
      </div>
    )
  }
}

const query = gql`
  query aSequence($sequenceNumber: Int!, $orderDirection: OrderDirection!) {
    nextStatement(
      sequenceNumber: $sequenceNumber
      orderDirection: $orderDirection
    ) {
      id
      sequenceNumber
      name
      portrait(properties: { width: 1920, height: 1920 })
    }
  }
`

export default compose(
  graphql(query, {
    props: ({ data }) => {
      return {
        loading: data.loading,
        error: data.error,
        statement: data.nextStatement,
      }
    },
  }),
  withRouter,
)(Image)
