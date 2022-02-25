import React from 'react'
import { Interaction } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import SubscribedDocuments from './SubscribedDocuments'
import SubscribedAuthors from './SubscribedAuthors'
import NotificationOptions from './NotificationOptions'
import withT from '../../lib/withT'
import { withMembership } from '../Auth/checkRoles'
import Box from '../Frame/Box'
import AccountSection from '../../components/Account/AccountSection'

export default compose(
  withT,
  withMembership,
)(({ t, isMember }) => {
  return (
    <>
      {!isMember && (
        <Box style={{ margin: '10px 0', padding: 15 }}>
          <Interaction.P>
            {t('Notifications/settings/noMembership')}
          </Interaction.P>
        </Box>
      )}

      <AccountSection title={t('Notifications/settings/discussion')}>
        <NotificationOptions />
      </AccountSection>

      <AccountSection title={t('Notifications/settings/formats')}>
        <SubscribedDocuments />
      </AccountSection>

      <AccountSection title={t('Notifications/settings/authors')}>
        <SubscribedAuthors />
      </AccountSection>
    </>
  )
})
