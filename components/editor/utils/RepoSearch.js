import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { Autocomplete } from '@project-r/styleguide'
import debounce from 'lodash.debounce'

import { GITHUB_ORG, REPO_PREFIX } from '../../../lib/settings'

const repoQuery = gql`
query repos($after: String, $search: String) {
  repos(first: 10, after: $after, search: $search) {
    totalCount
    pageInfo {
      endCursor
      hasNextPage
    }
    nodes {
      id
      meta {
        creationDeadline
        productionDeadline
        briefingUrl
      }
      latestCommit {
        id
        date
        message
        document {
          meta {
            template
            title
            publishDate
            credits
          }
        }
      }
      milestones {
        name
        immutable
      }
      latestPublications {
        name
        prepublication
        live
        scheduledAt
        commit {
          id
          document {
            meta {
              slug
            }
          }
        }
      }
    }
  }
}
`

const ConnectedAutoComplete = graphql(repoQuery, {
  skip: props => !props.filter,
  options: ({ filter }) => ({ variables: { search: filter } }),
  props: (props) => {
    if (props.data.loading) return
    const { data: { repos: { nodes = [] } } } = props
    return ({
      items: nodes.map(v => ({
        value: v.id,
        text: v.latestCommit.document.meta.title ||
          v.id.replace([GITHUB_ORG, REPO_PREFIX || ''].join('/'), '')
      }))
    })
  }
})(Autocomplete)

const safeValue = value =>
  typeof value === 'string'
  ? { value, text: value }
  : null

export default class RepoSearch extends Component {
  constructor (props) {
    super(props)
    this.state = {
      items: [],
      filter: '',
      search: '',
      value: safeValue(props.value)
    }
    this.filterChangeHandler = this.filterChangeHandler.bind(this)
    this.changeHandler = this.changeHandler.bind(this)
    this.setSearchValue = debounce(this.setSearchValue.bind(this), 500)
  }
  componentDidMount () {
    this._isMounted = true
  }

  componentWillUnmount () {
    this._isMounted = false
  }

  componentWillReceiveProps (nextProps) {
    this.setState({
      ...this.state,
      value: safeValue(nextProps.value)
    })
  }

  setSearchValue () {
    this.setState({
      ...this.state,
      search: this.state.filter
    })
  }

  filterChangeHandler (value) {
    this.setState(
        state => ({
          ...this.state,
          filter: value
        }),
        this.setSearchValue
      )
  }

  changeHandler (value) {
    this.setState(
        state => ({
          ...this.state,
          value
        }),
        () => this.props.onChange(value)
      )
  }

  render () {
    const { filter, value, search } = this.state

    return (
      <ConnectedAutoComplete
        label={this.props.label}
        filter={filter}
        value={value}
        search={search}
        items={[]}
        onChange={this.changeHandler}
        onFilterChange={this.filterChangeHandler}
        />
    )
  }
}
