import compose from 'lodash/flowRight'

import withSurviveStatus from './withSurviveStatus'
import withT from '../../lib/withT'
import withMe from '../../lib/apollo/withMe'

import { RawStatus } from './Status'

import { Interaction, A } from '@project-r/styleguide'
import Link from 'next/link'

const SurviveStatus = ({ t, crowdfunding, hasActiveMembership }) => {
  return <>
    <Interaction.H3>{t('crowdfunding/SurviveStatus/title')}</Interaction.H3>
    <RawStatus
      t={t}
      compact
      crowdfundingName={crowdfunding && crowdfunding.name}
      crowdfunding={
        crowdfunding && {
          ...crowdfunding,
          status: crowdfunding.status && {
            memberships: crowdfunding.status.memberships,
            people: crowdfunding.status.people,
            money: crowdfunding.status.money,
          },
        }
      }
      memberships
    />
    {hasActiveMembership && (
      <div>
        <Link href='/crowdfunding' passHref legacyBehavior>
          <A>{t('crowdfunding/SurviveStatus/link/crowdfunding2')}</A>
        </Link>
        {' – '}
        <A href='https://www.republik.ch/2020/03/01/textbausteine'>
          {t('crowdfunding/SurviveStatus/link/shareTemplates')}
        </A>
      </div>
    )}
  </>;
}

export default compose(withT, withMe, withSurviveStatus)(SurviveStatus)
