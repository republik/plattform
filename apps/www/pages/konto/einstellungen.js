import compose from 'lodash/flowRight'

import withT from '../../lib/withT'
import { withDefaultSSR } from '../../lib/apollo/helpers'
import Frame from '../../components/Frame'
import AccountTabs from '../../components/Account/AccountTabs'
import AccountSection from '../../components/Account/AccountSection'
import ProgressSettings from '../../components/Account/ProgressSettings'
import ProlitterisSettings from '../../components/Account/ProlitterisSettings'
import AuthSettings from '../../components/Account/AuthSettings'
import { AccountEnforceMe } from '../../components/Account/Elements'

import { APP_OPTIONS } from '../../lib/constants'

const SettingsPage = ({ t }) => {
  return (
    <Frame
      meta={{
        title: t('pages/account/settings/title'),
      }}
    >
      <AccountEnforceMe>
        <AccountTabs />

        <AccountSection id='position' title={t('account/progress/title')}>
          <ProgressSettings />
        </AccountSection>

        <AccountSection id='prolitteris' title='ProLitteris Integration'>
          <ProlitterisSettings />
        </AccountSection>

        {APP_OPTIONS && (
          <AccountSection
            id='anmeldung'
            title={t('account/authSettings/title')}
          >
            <AuthSettings />
          </AccountSection>
        )}
      </AccountEnforceMe>
    </Frame>
  )
}

export default withDefaultSSR(compose(withT)(SettingsPage))
