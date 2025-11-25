import { Component, Fragment, useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { css } from 'glamor'
import withT from '../../lib/withT'

import { ZINDEX_CONTENT } from '../constants'

import {
  A,
  Loader,
  InlineSpinner,
  Checkbox,
  Dropdown,
  mediaQueries,
  Interaction,
} from '@project-r/styleguide'

import {
  DISCUSSION_NOTIFICATION_CHANNELS,
  DISCUSSION_NOTIFICATION_OPTIONS,
} from '../Discussion/shared/constants'
import { withUpdateNotificationSettings } from '../Discussion/graphql/enhancers/withUpdateNotificationSettings'
import ErrorMessage from '../ErrorMessage'

const { P } = Interaction

const styles = {
  spinner: css({
    display: 'inline-block',
    height: 0,
    marginLeft: 15,
    verticalAlign: 'middle',
    '& > span': {
      display: 'inline',
    },
  }),
  dropdown: css({
    marginTop: 20,
    position: 'relative',
    zIndex: ZINDEX_CONTENT,
  }),
  dropdownItem: css({
    fontSize: 16,
    [mediaQueries.mUp]: {
      fontSize: 'inherit',
    },
  }),
  checkboxItem: css({
    marginBlock: '1em',
  }),
}

const ErrorContainer = ({ children }) => (
  <div style={{ marginTop: 20 }}>{children}</div>
)

const NotificationOptions = ({
  t,
  meDiscussionNotification,
  loading,
  error,
  updateNotificationSettings,
}) => {
  const [serverError, setServerError] = useState()
  const [mutatingChannel, setMutatingChannel] = useState()
  const [isMutatingDefaultOption, setMutatingDefaultOption] = useState(false)

  return (
    <Loader
      loading={loading}
      error={error}
      ErrorContainer={ErrorContainer}
      render={() => {
        const { notificationChannels, defaultDiscussionNotificationOption } =
          meDiscussionNotification
        // the 'ALL' option is confusing as a default as it will show
        // on discussions but only gets truly 'activated' when you take
        // part in it, yielding a different behaviour from setting an
        // individual discussion to ALL.
        // The best resolution here seems to not show it in the overall
        // settings, except for the few users who have it set as such already
        const dropdownItems = DISCUSSION_NOTIFICATION_OPTIONS.filter(
          (option) =>
            defaultDiscussionNotificationOption === 'ALL' || option !== 'ALL',
        ).map((option) => ({
          value: option,
          text: t(`components/Discussion/Notification/${option}/label`),
          element: (
            <span {...styles.dropdownItem}>
              {t(`components/Discussion/Notification/${option}/label`)}
            </span>
          ),
        }))

        return (
          <Fragment>
            <P>{t('account/notificationChannels/intro')}</P>
            {DISCUSSION_NOTIFICATION_CHANNELS.map((channel) => (
              <p {...styles.checkboxItem} key={channel}>
                <Checkbox
                  disabled={!!mutatingChannel}
                  checked={notificationChannels.indexOf(channel) > -1}
                  onChange={(_, checked) => {
                    let channels = [].concat(notificationChannels)
                    if (checked) {
                      channels.push(channel)
                    } else {
                      channels.splice(channels.indexOf(channel), 1)
                    }
                    setMutatingChannel(channel)
                    updateNotificationSettings({
                      notificationChannels: channels,
                    }).then(
                      () => {
                        setServerError()
                        setMutatingChannel()
                      },
                      (reason) => {
                        setServerError(reason)
                        setMutatingChannel()
                      },
                    )
                  }}
                >
                  {t(`account/notificationChannels/${channel}/label`)}
                  {mutatingChannel === channel && (
                    <span {...styles.spinner}>
                      <InlineSpinner size={24} />
                    </span>
                  )}
                </Checkbox>
              </p>
            ))}
            <P style={{ marginTop: 10 }}>
              {t('account/notificationOptions/dialog')}
            </P>
            <div {...styles.dropdown}>
              <Dropdown
                label={t('account/defaultDiscussionNotificationOption/label')}
                items={dropdownItems}
                value={defaultDiscussionNotificationOption}
                onChange={(item) => {
                  setMutatingDefaultOption(true)
                  updateNotificationSettings({
                    defaultDiscussionNotificationOption: item.target
                      ? item.target.value
                      : item.value,
                  }).then(
                    () => {
                      setServerError()
                      setMutatingDefaultOption(false)
                    },
                    (reason) => {
                      setServerError(reason)
                      setMutatingDefaultOption(false)
                    },
                  )
                }}
              />
              {isMutatingDefaultOption && (
                <span {...styles.spinner}>
                  <InlineSpinner size={24} />
                </span>
              )}
            </div>
            {serverError && <ErrorMessage error={serverError} />}
          </Fragment>
        )
      }}
    />
  )
}

const query = gql`
  query myDiscussionNotificationSettings {
    meDiscussionNotification: me {
      id
      notificationChannels
      defaultDiscussionNotificationOption
    }
  }
`

export default compose(
  withUpdateNotificationSettings,
  graphql(query, {
    props: ({ data }) => ({
      loading: data.loading,
      error: data.error,
      meDiscussionNotification: data.meDiscussionNotification,
    }),
  }),
  withT,
)(NotificationOptions)
