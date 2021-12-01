import React, { Component } from 'react'
import { graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { Autocomplete, InlineSpinner } from '@project-r/styleguide'
import debounce from 'lodash.debounce'

import { GITHUB_ORG, REPO_PREFIX } from '../../../lib/settings'
import {
  displayDateTime,
  displayDateTimeFormat
} from '../../../lib/utils/calendar'
import { swissTime } from '../../../lib/utils/format'
import withT from '../../../lib/withT'

export const filterRepos = gql`
  query searchRepo(
    $after: String
    $search: String
    $template: String
    $isSeriesMaster: Boolean
    $isSeriesEpisode: Boolean
  ) {
    repos: reposSearch(
      first: 10
      after: $after
      search: $search
      template: $template
      isTemplate: false
      isSeriesMaster: $isSeriesMaster
      isSeriesEpisode: $isSeriesEpisode
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        meta {
          publishDate
        }
        latestPublications {
          document {
            meta {
              publishDate
            }
          }
        }
        latestCommit {
          id
          document {
            id
            meta {
              title
              shortTitle
              image
              description
              credits
              kind
              color
              shareLogo
              shareBackgroundImage
              shareBackgroundImageInverted
              format {
                id
                repoId
                meta {
                  title
                  color
                  kind
                }
              }
              section {
                id
                repoId
                meta {
                  title
                  color
                  kind
                }
              }
              series {
                title
                description
                logo
                logoDark
                overview {
                  id
                  repoId
                  meta {
                    path
                  }
                }
                episodes {
                  title
                  publishDate
                  label
                  lead
                  image
                  document {
                    id
                    repoId
                    meta {
                      path
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const RepoItem = withT(({ t, repo }) => {
  const title =
    repo.latestCommit.document.meta.title ||
    repo.id.replace([GITHUB_ORG, REPO_PREFIX || ''].join('/'), '')
  const publicationDate =
    repo?.latestPublications[0]?.document.meta.publishDate ||
    repo.meta.publishDate
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {title}
      <br />
      <small>
        {publicationDate ? (
          swissTime.format('%d.%m.%y')(new Date(publicationDate))
        ) : (
          <em>{t('repo/search/notPublished')}</em>
        )}
      </small>
    </div>
  )
})

const ConnectedAutoComplete = graphql(filterRepos, {
  skip: props => !props.filter,
  options: ({ search, template, isSeriesEpisode, isSeriesMaster }) => ({
    fetchPolicy: 'network-only',
    variables: { search, template, isSeriesEpisode, isSeriesMaster }
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
        element: <RepoItem repo={v} />
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
        isSeriesMaster={this.props.isSeriesMaster}
        isSeriesEpisode={this.props.isSeriesEpisode}
        items={[]}
        onChange={this.changeHandler}
        onFilterChange={this.filterChangeHandler}
      />
    )
  }
}
