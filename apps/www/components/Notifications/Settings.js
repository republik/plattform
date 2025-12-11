import compose from 'lodash/flowRight'
import SubscribedDocuments from './SubscribedDocuments'
import SubscribedAuthors from './SubscribedAuthors'
import NotificationOptions from './NotificationOptions'
import withT from '../../lib/withT'
import { withMembership } from '../Auth/checkRoles'
import AccountSection from '../../components/Account/AccountSection'

export default compose(
  withT,
  withMembership,
)(({ t }) => {
  return (
    <>
      <AccountSection title={t('Notifications/settings/title')}>
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
