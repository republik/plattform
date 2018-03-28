import React, { Component } from 'react'
import { gql, graphql } from 'react-apollo'
import { css, merge } from 'glamor'
import {
  colors,
  Label,
  Overlay,
  OverlayBody,
  Interaction,
  Button
} from '@project-r/styleguide'
import { compose } from 'redux'
import { getInitials } from '../../lib/utils/name'
import Loader from '../../components/Loader'
import withT from '../../lib/withT'
import withMe from '../../lib/withMe'

const styles = {
  container: css({
    display: 'flex',
    flexFlow: 'row wrap',
    fontSize: '11px',
    padding: '5px 0',
    justifyContent: 'space-around'
  }),
  initials: {
    backgroundColor: '#ccc',
    color: '#000',
    cursor: 'default',
    fontSize: 16,
    height: 40,
    lineHeight: '40px',
    margin: '0 4px 4px 0',
    textAlign: 'center',
    textTransform: 'uppercase',
    width: 40
  },
  initialsPlaceholder: {
    backgroundColor: '#fff',
    border: `1px solid ${colors.divider}`
  }
}

const query = gql`
  query repoUncommitted($repoId: ID!) {
    repo(id: $repoId) {
      id
      uncommittedChanges {
        id
        email
        name
      }
    }
  }
`

const uncommittedChangesSubscription = gql`
  subscription onUncommitedChange(
    $repoId: ID!
  ) {
    uncommittedChanges(
      repoId: $repoId
    ) {
      repoId
      action
      user {
        id
        email
        name
      }
    }
  }
`

export const TagsCompact = ({repo, t}) => (
  <div {...styles.container}>
    {repo.uncommittedChanges.length
      ? repo.uncommittedChanges.map(user =>
        <span key={user.id} {...css(styles.initials)} title={user.email}>
          {getInitials(user)}
        </span>
      )
      : (
        <span {...merge(styles.initials, styles.initialsPlaceholder)}
          title={t('uncommittedChanges/empty')} />
        )
    }
  </div>
)

export const Tags = ({repo}) => (
  <div {...styles.container}>
    {repo.uncommittedChanges.map(user =>
      <div style={{marginRight: 4, textAlign: 'center'}}>
        <div key={user.id} {...merge(css(styles.initials), {display: 'inline-block'})} title={user.email}>
          {getInitials(user)}
        </div><br />
        <Label>
          {user.name}
        </Label>
      </div>
      )
    }
  </div>
)

class UncommittedChanges extends Component {
  constructor (...args) {
    super(...args)
    this.state = {}
  }

  componentDidMount () {
    this.subscribe()
  }

  componentDidUpdate () {
    this.subscribe()
  }

  subscribe () {
    if (!this.unsubscribe && this.props.data.repo) {
      this.unsubscribe = this.props.subscribeToNewChanges()
    }
  }

  componentWillUnmount () {
    this.unsubscribe && this.unsubscribe()
  }

  render () {
    const { data: { loading, error, repo }, t, me, onRevert } = this.props

    const state = this.state

    if (repo) {
      const iHaveUncommitedChanges = repo.uncommittedChanges.find(u => u.id === me.id)
      if (
        !state.isOpen &&
        iHaveUncommitedChanges &&
        repo.uncommittedChanges.length > 1 &&
        !state.suppress
      ) {
        this.setState({ isOpen: true })
      } else if (
        state.isOpen && (
          state.suppress ||
          (repo.uncommittedChanges.length <= 1 && state.isOpen)
        )
      ) {
        this.setState({ isOpen: false })
      }
      if (state.suppress && repo.uncommittedChanges.length <= 1) {
        this.setState({ suppress: false })
      }
    }

    return (
      <Loader loading={loading} error={error} render={() => (
        <div>
          {state.isOpen && (
          <Overlay onClose={() => { this.setState({isOpen: false}) }}>
            <OverlayBody>
              <Interaction.P style={{height: '100vh'}}>
                <p>{t('uncommittedChanges/warning')}</p>
                <Tags repo={repo} />
                <p>
                  <Button primary block onClick={() => { this.setState({suppress: true}) }}>
                    {t('uncommittedChanges/ignore')}
                  </Button>
                </p>
                <p>
                  <Button block onClick={onRevert}>
                    {t('uncommittedChanges/revert')}
                  </Button>
                </p>
              </Interaction.P>
            </OverlayBody>
          </Overlay>
            )}
          <div style={{ textAlign: 'center', fontSize: '14px', marginTop: 7 }}>
            <Label key='label'>{t('uncommittedChanges/title')}</Label>
          </div>
          <TagsCompact repo={repo} t={t} />
        </div>
      )} />
    )
  }
}

export default compose(
  withT,
  withMe,
  graphql(query, {
    props: props => {
      return {
        ...props,
        subscribeToNewChanges: params => {
          return props.data.subscribeToMore({
            document: uncommittedChangesSubscription,
            variables: {
              repoId: props.data.repo.id
            },
            updateQuery: (prev, { subscriptionData }) => {
              if (!subscriptionData.data) {
                console.warn('empty subscription data')
                return prev
              }
              let uncommittedChanges = prev.repo.uncommittedChanges
              const action = subscriptionData.data.uncommittedChanges.action
              if (action === 'create') {
                const newUser = subscriptionData.data.uncommittedChanges.user
                if (!uncommittedChanges.find(user => user.id === newUser.id)) {
                  uncommittedChanges = uncommittedChanges.concat(
                    newUser
                  )
                }
              } else if (action === 'delete') {
                uncommittedChanges = uncommittedChanges.filter(
                  change =>
                    change.id !==
                    subscriptionData.data.uncommittedChanges.user.id
                )
              }
              return {
                ...prev,
                repo: {
                  ...prev.repo,
                  uncommittedChanges
                }
              }
            }
          })
        }
      }
    }
  })
)(UncommittedChanges)
