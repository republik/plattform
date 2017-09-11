import React, { Component } from 'react'
import { compose } from 'redux'
import { Router } from '../../lib/routes'
import withData from '../../lib/apollo/withData'
import { gql, graphql } from 'react-apollo'
import { css } from 'glamor'
import { Raw, resetKeyGenerator } from 'slate'
import { A, Button, Label } from '@project-r/styleguide'

import Frame from '../../components/Frame'
import RepoNav from '../../components/Repo/Nav'
import Editor, { serializer, newDocument } from '../../components/editor/NewsletterEditor'

import EditSidebar from '../../components/EditSidebar'
import Loader from '../../components/Loader'
import Checklist from '../../components/EditSidebar/Checklist'
import CommitHistory from '../../components/EditSidebar/CommitHistory'
import UncommittedChanges from '../../components/EditSidebar/UncommittedChanges'
import withAuthorization from '../../components/Auth/withAuthorization'
import withT from '../../lib/withT'

import initLocalStore from '../../lib/utils/localStorage'

const fragments = {
  commit: gql`
    fragment EditPageCommit on Commit {
      id
      message
      parentIds
      date
      author {
        email
        name
      }
      document {
        content
        commit {
          id
          message
        }
        meta {
          title
        }
      }
    }
  `
}

const query = gql`
  query repo($repoId: ID!) {
    repo(id: $repoId) {
      id
      commits(page: 1) {
        ...EditPageCommit
      }
    }
  }
  ${fragments.commit}
`
const commitMutation = gql`
  mutation commit(
    $repoId: ID!
    $parentId: ID
    $message: String!
    $document: DocumentInput!
  ) {
    commit(
      repoId: $repoId
      parentId: $parentId
      message: $message
      document: $document
    ) {
      ...EditPageCommit
    }
  }
  ${fragments.commit}
`

const uncommittedChangesMutation = gql`
  mutation uncommittedChanges($repoId: ID!, $action: Action!) {
    uncommittedChanges(repoId: $repoId, action: $action)
  }
`

const styles = {
  uncommittedChanges: {
    fontSize: '13px',
    margin: '0 0 20px'
  },
  danger: {
    color: 'red'
  },
  button: {
    height: 40,
    fontSize: '16px'
  }
}

class EditorPage extends Component {
  constructor (...args) {
    super(...args)

    this.changeHandler = this.changeHandler.bind(this)
    this.commitHandler = this.commitHandler.bind(this)
    this.documentChangeHandler = this.documentChangeHandler.bind(this)
    this.revertHandler = this.revertHandler.bind(this)

    this.state = {
      committing: false,
      editorState: null,
      repo: null,
      uncommittedChanges: null
    }
  }

  beginChanges (repoId) {
    this.setState({
      uncommittedChanges: true
    })
    this.props.uncommittedChangesMutation({
      repoId: repoId,
      action: 'create'
    }).catch(error => {
      console.log('uncommittedChangesMutation error')
      console.log(error)
    })
  }

  concludeChanges (repoId) {
    this.setState({
      uncommittedChanges: false
    })
    this.props.uncommittedChangesMutation({
      repoId: repoId,
      action: 'delete'
    }).catch(error => {
      console.log('uncommittedChangesMutation error')
      console.log(error)
    })
  }

  componentWillMount () {
    resetKeyGenerator()
    this.loadState(this.props)
  }

  componentWillReceiveProps (nextProps) {
    resetKeyGenerator()
    this.loadState(nextProps)
  }

  checkLocalStorageSupport () {
    if (
      process.browser &&
      this.store &&
      !this.store.supported
    ) {
      this.setState({
        localStorageUnavailable: true
      })
    }
  }
  componentDidMount () {
    this.checkLocalStorageSupport()
  }

  revertHandler (e) {
    e.preventDefault()
    this.store.clear()
    this.loadState(this.props)
  }

  loadState (props) {
    const {
      t,
      data: { loading, error, repo } = {},
      url
    } = props

    if (loading || error) {
      return
    }
    if (!url.query.commitId && repo && repo.commits.length) {
      if (process.browser) {
        Router.replaceRoute('repo/edit', {
          repoId: url.query.repoId.split('/'),
          commitId: repo.commits[0].id
        })
      }
      return
    }
    const repoId = url.query.repoId
    const commitId = url.query.commitId || 'new'

    const storeKey = [repoId, commitId].join('/')
    if (!this.store || this.store.key !== storeKey) {
      this.store = initLocalStore(storeKey)
      this.checkLocalStorageSupport()
    }

    let committedEditorState
    if (commitId === 'new') {
      committedEditorState = newDocument(url.query)
    } else {
      const commit = repo.commits.find(commit => {
        return commit.id === commitId
      })
      if (!commit) {
        this.setState({error: t('edit/missingCommit', {commitId})})
        return
      }

      const json = commit.document.content
      committedEditorState = serializer.deserialize(json, {
        mdast: true
      })

      this.setState({
        commit: commit
      })
    }
    const committedRawString = JSON.stringify(
      Raw.serialize(committedEditorState, {
        terse: true
      })
    )

    let localState = this.store.get('editorState')
    let localEditorState
    if (localState) {
      try {
        localEditorState = Raw.deserialize(localState, {
          terse: true
        })
      } catch (e) {
        console.log('parsing error', e)
      }
    }

    if (localEditorState) {
      this.beginChanges(repoId)
      this.setState({
        editorState: localEditorState,
        committedRawString
      })
    } else {
      this.concludeChanges(repoId)
      this.setState({
        editorState: committedEditorState,
        committedRawString
      })
    }
  }

  changeHandler (newEditorState) {
    this.setState({ editorState: newEditorState })
  }

  documentChangeHandler (_, newEditorState) {
    const { url: { query: { repoId } } } = this.props
    const { committedRawString, uncommittedChanges } = this.state

    const newRaw = Raw.serialize(newEditorState, {
      terse: true
    })

    if (
      JSON.stringify(newRaw) !== committedRawString
    ) {
      this.store.set('editorState', newRaw)

      if (!uncommittedChanges) {
        this.beginChanges(repoId)
      }
    } else {
      if (uncommittedChanges) {
        this.store.clear()
        this.concludeChanges(repoId)
      }
    }
  }

  commitHandler () {
    const {
      url: { query: { repoId, commitId } },
      commitMutation
    } = this.props
    const { editorState } = this.state

    const message = window.prompt('Commit message:')
    if (!message) {
      return
    }
    this.setState({
      committing: true
    })

    commitMutation({
      repoId,
      parentId: commitId === 'new'
        ? null
        : commitId,
      message: message,
      document: {
        content: serializer.serialize(editorState, {
          mdast: true
        })
      }
    })
      .then(({data}) => {
        this.store.clear()
        this.concludeChanges(repoId)

        this.setState({
          committing: false,
          uncommittedChanges: false
        })
        Router.replaceRoute('repo/edit', {
          repoId: repoId.split('/'),
          commitId: data.commit.id
        })
      })
      .catch(e => {
        console.log('commit catched')
        console.log(e)
      })
  }

  render () {
    const { url, t, data = {} } = this.props
    const { repoId, commitId } = url.query
    const { loading, repo } = data
    const {
      editorState,
      committing,
      uncommittedChanges,
      localStorageUnavailable
    } = this.state
    const sidebarWidth = 200

    const isNew = commitId === 'new'
    const error = data.error || this.state.error
    const showLoading = committing || loading || (!editorState && !error)

    return (
      <Frame url={url} raw nav={<RepoNav route='repo/edit' url={url} />}>
        <Loader loading={showLoading} error={error} render={() => (
          <div>
            <div style={{paddingRight: sidebarWidth}}>
              <Editor
                state={editorState}
                onChange={this.changeHandler}
                onDocumentChange={this.documentChangeHandler}
              />
            </div>
            <EditSidebar width={sidebarWidth}>
              {localStorageUnavailable &&
                <div {...css(styles.danger)}>
                  {t('commit/warn/noStorage')}
                </div>}
              <div {...css(styles.uncommittedChanges)}>
                <div style={{marginBottom: 10}}>
                  <Label style={{fontSize: 12}}>
                    {uncommittedChanges
                      ? <span>{t('commit/status/uncommitted')}</span>
                      : <span>{!isNew && t('commit/status/committed')}</span>
                    }
                  </Label>
                </div>

                <Button
                  primary
                  block
                  disabled={!uncommittedChanges}
                  onClick={this.commitHandler}
                  style={styles.button}
                >
                  {t('commit/button')}
                </Button>

                {!!uncommittedChanges && (
                  <div style={{textAlign: 'center', marginTop: 10}}>
                    <A href='#' onClick={this.revertHandler}>
                      {t('commit/revert')}
                    </A>
                  </div>
                )}
              </div>

              {!!repo && (
                <div>
                  <Label>{t('checklist/title')}</Label>
                  <Checklist
                    disabled={!!uncommittedChanges}
                    repoId={repoId}
                    commitId={commitId}
                  />
                  <Label>{t('commitHistory/title')}</Label>
                  <CommitHistory
                    commits={repo.commits}
                    repoId={repoId}
                  />
                  <Label>{t('uncommittedChanges/title')}</Label>
                  <UncommittedChanges repoId={repoId} />
                </div>
              )}
            </EditSidebar>
          </div>
        )} />
      </Frame>
    )
  }
}

export default compose(
  withData,
  withT,
  withAuthorization(['editor']),
  graphql(query, {
    skip: ({ url }) => url.query.commitId === 'new',
    options: ({ url }) => ({
      variables: {
        repoId: url.query.repoId
      }
    })
  }),
  graphql(commitMutation, {
    props: ({ mutate, ownProps: { url } }) => ({
      commitMutation: variables =>
        mutate({
          variables,
          update: (proxy, { data: { commit } }) => {
            const variables = {
              repoId: url.query.repoId
            }
            const data = proxy.readQuery({
              query,
              variables
            })
            data.repo.commits = [
              commit,
              ...data.repo.commits
            ]
            proxy.writeQuery({
              query: query,
              variables,
              data
            })
          }
        })
    })
  }),
  graphql(uncommittedChangesMutation, {
    props: ({ mutate }) => ({
      uncommittedChangesMutation: variables =>
        mutate({
          variables
        })
    })
  })
)(EditorPage)
