import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { Autocomplete, InlineSpinner } from '@project-r/styleguide'
import debounce from 'lodash.debounce'

import { GITHUB_ORG, REPO_PREFIX } from '../../../lib/settings'

// TMP: rm series for now because API can't handle it properly yet
//             series {
//               title
//               episodes {
//                 title
//               }
//             }
export const filterRepos = gql`
  query searchRepo($after: String, $search: String, $template: String) {
    repos: reposSearch(
      first: 10
      after: $after
      search: $search
      template: $template
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        latestCommit {
          id
          document {
            id
            meta {
              title
              shortTitle
              image
              description
              subject
              credits
              kind
              color
              format {
                id
                repoId
                meta {
                  title
                  color
                  kind
                }
              }
            }
          }
        }
      }
    }
  }
`

const ConnectedAutoComplete = graphql(filterRepos, {
  skip: props => !props.filter,
  options: ({ search, template }) => ({
    fetchPolicy: 'network-only',
    variables: { search: search, template: template }
  }),
  props: props => {
    if (props.data.loading) return { data: props.data, items: [] }
    const {
      data: { repos: { nodes = [] } = {} }
    } = props
    return {
      data: props.data,
      items: nodes.map(v => ({
        value: v,
        text:
          v.latestCommit.document.meta.title ||
          v.id.replace([GITHUB_ORG, REPO_PREFIX || ''].join('/'), '')
      }))
    }
  }
})(props => {
  const showLoader = props.data && props.data.loading
  return (
    <span style={{ position: 'relative', display: 'block' }}>
      <Autocomplete key='autocomplete' {...props} />
      {!!showLoader && (
        <span
          style={{
            position: 'absolute',
            top: '21px',
            right: '0px',
            zIndex: 500
          }}
        >
          <InlineSpinner size={35} />
        </span>
      )}
    </span>
  )
})

const safeValue = value =>
  typeof value === 'string' ? { value, text: value } : null

export default class RepoSearch extends Component {
  constructor(props) {
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

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      value: safeValue(nextProps.value)
    })
  }

  componentWillUnmount() {
    this.setSearchValue.cancel()
  }

  setSearchValue() {
    this.setState({
      search: this.state.filter
    })
  }

  filterChangeHandler(value) {
    this.setState(
      state => ({
        filter: value
      }),
      this.setSearchValue
    )
  }

  changeHandler(value) {
    this.setState(
      state => ({
        value: null,
        filter: null
      }),
      () => this.props.onChange(value)
    )
  }

  render() {
    const { filter, value, search } = this.state

    return (
      <ConnectedAutoComplete
        label={this.props.label}
        filter={filter}
        value={value}
        search={search}
        template={this.props.template}
        items={[]}
        onChange={this.changeHandler}
        onFilterChange={this.filterChangeHandler}
      />
    )
  }
}
