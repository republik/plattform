import { Component, Fragment } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css, merge } from 'glamor'
import {
  colors,
  Label,
  Overlay,
  OverlayBody,
  Interaction,
  Button,
  A,
  Spinner,
} from '@project-r/styleguide'
import { getInitials } from '../../lib/utils/name'
import withT from '../../lib/withT'
import withMe from '../../lib/withMe'
import { GHOST_PRODUCER } from '../../lib/settings'
import { errorToString } from '../../lib/utils/errors'
import {
  UNCOMMITTED_CHANGES_POLL_INTERVAL_MS,
  MILESTONES_POLL_INTERVAL_MS,
} from '../../lib/settings'
import { IconWifiOff as OfflineIcon } from '@republik/icons' // portable-wifi-off

import createDebug from 'debug'

import { getMilestones } from './Checklist'

import { parseJSONObject } from '../../lib/safeJSON'
import { getRepoIdFromQuery } from '../../lib/repoIdHelper'

const debug = createDebug('publikator:uncommittedChanges')
const ghostProducer = parseJSONObject(GHOST_PRODUCER)

const getUncommittedChanges = gql`
  query getUncommittedChanges($repoId: ID!) {
    repo(id: $repoId) {
      id
      uncommittedChanges {
        id
        email
        name
        portrait(properties: { width: 160, height: 160 })
      }
      currentPhase {
        lock
      }
    }
  }
`

const uncommittedChangesSubscription = gql`
  subscription onUncommitedChange($repoId: ID!) {
    uncommittedChanges(repoId: $repoId) {
      repoId
      action
      user {
        id
        email
        name
        portrait(properties: { width: 160, height: 160 })
      }
    }
  }
`

const uncommittedChangesMutation = gql`
  mutation uncommittedChanges($repoId: ID!, $action: Action!) {
    uncommittedChanges(repoId: $repoId, action: $action)
  }
`

export const withUncommittedChangesMutation = graphql(
  uncommittedChangesMutation,
  {
    props: ({ mutate }) => ({
      hasUncommitedChanges: (variables) =>
        mutate({
          variables,
        }),
    }),
  },
)

export const warningColor = '#E9A733'

const styles = {
  container: css({
    display: 'flex',
    flexFlow: 'row wrap',
    fontSize: '11px',
    padding: '3px 0',
    justifyContent: 'space-around',
  }),
  box: {
    color: '#000',
    cursor: 'default',
    height: 40,
    lineHeight: '40px',
    width: 40,
    margin: '0 4px 4px 0',
    textAlign: 'center',
    fontSize: 16,
    position: 'relative',
  },
}

styles.initials = merge(styles.box, {
  backgroundColor: '#ccc',
  textTransform: 'uppercase',
  backgroundPosition: 'center center',
  backgroundSize: '150%',
})

styles.emptyBox = merge(styles.box, {
  backgroundColor: '#fff',
  border: `1px solid ${colors.divider}`,
})

export const withUncommitedChanges =
  ({ options } = {}) =>
  (WrappedComponent) => {
    class UncommittedChanges extends Component {
      constructor(...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount() {
        this.subscribe()
      }
      componentDidUpdate() {
        this.subscribe()
      }
      subscribe() {
        if (!this.unsubscribe && this.props.data.repo) {
          this.unsubscribe = this.props.subscribe({
            onError: (error) => {
              debug('subscription', 'error', error)
              this.setState({
                subscriptionError: error,
              })
            },
            onUpdate: () => {
              this.setState({
                subscriptionError: undefined,
              })
            },
          })
        }
      }
      componentWillUnmount() {
        this.unsubscribe && this.unsubscribe()
      }
      render() {
        const {
          data: { loading, error, repo },
          me,
          ownProps,
        } = this.props

        const users = [].concat((repo && repo.uncommittedChanges) || [])

        const isLocked = repo && repo.currentPhase.lock
        const meIsProducer = me && me.roles.find((role) => role === 'producer')
        if (isLocked && !meIsProducer && ghostProducer.id) {
          users.push(ghostProducer)
        }

        return (
          <WrappedComponent
            uncommittedChanges={{
              loading,
              error: this.state.subscriptionError || error,
              users,
            }}
            {...ownProps}
          />
        )
      }
    }

    return compose(
      withMe,
      graphql(getMilestones, {
        options: ({ repoId, router }) => ({
          pollInterval: MILESTONES_POLL_INTERVAL_MS,
          variables: {
            repoId: repoId || getRepoIdFromQuery(router.query),
          },
        }),
        props: ({ data }) => ({
          milestones: data.repo && data.repo.milestones,
        }),
      }),
      graphql(getUncommittedChanges, {
        options: (props) => ({
          fetchPolicy: 'network-only',
          pollInterval: UNCOMMITTED_CHANGES_POLL_INTERVAL_MS,
          variables: { repoId: props.repoId },
          ...(typeof options === 'function' ? options(props) : options),
        }),
        props: ({ data, ownProps }) => {
          return {
            ownProps,
            data: data,
            subscribe: ({ onError, onUpdate }) => {
              return data.subscribeToMore({
                document: uncommittedChangesSubscription,
                variables: {
                  repoId: data.repo.id,
                },
                onError,
                updateQuery: (prev, { subscriptionData }) => {
                  debug('subscription', 'update', subscriptionData)
                  if (!subscriptionData.data) {
                    console.warn('empty subscription data')
                    return prev
                  }
                  let uncommittedChanges = prev.repo.uncommittedChanges
                  const action = subscriptionData.data.uncommittedChanges.action
                  if (action === 'create') {
                    const newUser =
                      subscriptionData.data.uncommittedChanges.user
                    if (
                      !uncommittedChanges.find((user) => user.id === newUser.id)
                    ) {
                      uncommittedChanges = uncommittedChanges.concat(newUser)
                    }
                  } else if (action === 'delete') {
                    uncommittedChanges = uncommittedChanges.filter(
                      (change) =>
                        change.id !==
                        subscriptionData.data.uncommittedChanges.user.id,
                    )
                  }
                  onUpdate()
                  return {
                    ...prev,
                    repo: {
                      ...prev.repo,
                      uncommittedChanges,
                    },
                  }
                },
              })
            },
          }
        },
      }),
    )(UncommittedChanges)
  }

const Initials = ({ uncommittedChanges, t }) => (
  <div {...styles.container}>
    {!!uncommittedChanges.loading && (
      <span {...styles.emptyBox}>
        <Spinner size={20} />
      </span>
    )}
    {!!uncommittedChanges.error && (
      <span
        {...styles.emptyBox}
        title={errorToString(uncommittedChanges.error)}
      >
        <OfflineIcon
          size={20}
          color={colors.error}
          style={{ marginBottom: 6 }}
        />
      </span>
    )}
    {uncommittedChanges.users.length ? (
      uncommittedChanges.users.map((user) => (
        <span
          key={user.id}
          {...css(styles.initials)}
          title={`${user.name} (${user.email})`}
          style={{
            backgroundImage: user.portrait
              ? `url(${user.portrait})`
              : undefined,
          }}
        >
          {!user.portrait && getInitials(user)}
        </span>
      ))
    ) : (
      <span {...styles.emptyBox} title={t('uncommittedChanges/empty')} />
    )}
  </div>
)

const Tags = ({ uncommittedChanges }) => (
  <div {...styles.container} style={{ margin: '40px 0' }}>
    {uncommittedChanges.users.map((user) => (
      <div key={user.id} style={{ marginRight: 4, textAlign: 'center' }}>
        <div
          {...css(styles.initials)}
          style={{ display: 'inline-block' }}
          title={user.email}
        >
          {getInitials(user)}
        </div>
        <br />
        <Label>{user.name}</Label>
      </div>
    ))}
  </div>
)

export const joinUsers = (users, t) =>
  users
    .map((user) => user.name)
    .reduce((string, name, index, array) =>
      [string, name].join(
        t(
          `uncommittedChanges/users/separator/${
            index === array.length - 1 ? 'last' : 'other'
          }`,
        ),
      ),
    )

export const ActiveInterruptionOverlay = withT(
  ({ uncommittedChanges, interruptingUsers, onRevert, onAcknowledged, t }) => (
    <Overlay onClose={() => {}} mUpStyle={{ minHeight: 0 }}>
      <OverlayBody style={{ padding: 20 }}>
        <Interaction.P>
          {t.pluralize('uncommittedChanges/interruption/text', {
            count: interruptingUsers.length,
            interruptingUsers: joinUsers(interruptingUsers, t),
          })}
        </Interaction.P>
        <Tags uncommittedChanges={uncommittedChanges} />
        <Interaction.P>
          {t('uncommittedChanges/interruption/note')}
        </Interaction.P>
        <p>
          <Button
            primary
            block
            onClick={onAcknowledged}
            style={{
              backgroundColor: warningColor,
              borderColor: warningColor,
            }}
          >
            {t('uncommittedChanges/acknowledged')}
          </Button>
        </p>
        <p>
          <A
            href='#'
            style={{ display: 'block', textAlign: 'center' }}
            onClick={onRevert}
          >
            {t('uncommittedChanges/revert')}
          </A>
        </p>
      </OverlayBody>
    </Overlay>
  ),
)

export const UncommittedChanges = ({ uncommittedChanges, t }) =>
  !!uncommittedChanges.users.length && (
    <Fragment>
      <div style={{ textAlign: 'center', fontSize: '14px', marginTop: 7 }}>
        <Label key='label'>{t('uncommittedChanges/title')}</Label>
      </div>
      <Initials uncommittedChanges={uncommittedChanges} t={t} />
    </Fragment>
  )

export default compose(withT, withUncommitedChanges())(UncommittedChanges)
