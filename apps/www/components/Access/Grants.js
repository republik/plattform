import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

import { Interaction, A } from '@project-r/styleguide'

import { timeFormat } from '../../lib/utils/format'
import query from '../Account/belongingsQuery'
import withInNativeApp from '../../lib/withInNativeApp'
import withT from '../../lib/withT'
import Link from 'next/link'

const { P } = Interaction

const dayFormat = timeFormat('%e. %B %Y')

const getAccessGrants = (accessGrants, type) => {
  return (
    accessGrants.length > 0 &&
    accessGrants.filter((grant) => {
      return grant.campaign.type === type
    })
  )
}

const AccessGrants = ({ accessGrants, inNativeIOSApp, t }) => {
  const regularAccessGrants = getAccessGrants(accessGrants, 'REGULAR')
  const maxEndAt =
    regularAccessGrants.length > 0 &&
    regularAccessGrants.reduce(
      (acc, grant) =>
        new Date(grant.endAt) > acc ? new Date(grant.endAt) : acc,
      new Date(),
    )

  /* TODO: Special solution for CLIMATE lab, should be removed later */
  const reducedAccessGrants = getAccessGrants(accessGrants, 'REDUCED')

  const climateLabTrials = reducedAccessGrants.filter(
    (grant) => grant.campaign.id === 'f35c2fcf-c254-482e-b4fb-5c51a48a13d2',
  )
  const climateLab = reducedAccessGrants.filter(
    (grant) => grant.campaign.id === '3684f324-b694-4930-ad1a-d00a2e00934b',
  )
  const climateLabBeginDate = climateLab.length
    ? new Date(climateLab[0].beginAt)
    : null

  const reducedMaxEndAt = climateLabTrials.length
    ? climateLabTrials.reduce(
        (acc, grant) =>
          new Date(grant.endAt) > acc ? new Date(grant.endAt) : acc,
        new Date(),
      )
    : climateLabBeginDate &&
      new Date(climateLabBeginDate.setMonth(climateLabBeginDate.getMonth() + 1))

  /* End special solution */

  return maxEndAt ? (
    <P>
      {t.elements('Account/Access/Grants/message/claimed', {
        maxEndAt: <span>{dayFormat(new Date(maxEndAt))}</span>,
      })}
      {!inNativeIOSApp && (
        <>
          {' '}
          <Link href='/angebote' key='pledge' passHref legacyBehavior>
            <A>
              <strong>{t('Account/Access/Grants/link/pledges')}</strong>
            </A>
          </Link>
        </>
      )}
    </P>
  ) : /* TODO: special solution for CLIMATE lab, should be removed later on */
  reducedMaxEndAt ? (
    <P>
      {t.elements('Account/Access/Grants/REDUCED/message/claimed', {
        campaignTitle: 'Klimalabor',
        maxEndAt: <span>{dayFormat(new Date(reducedMaxEndAt))}</span>,
      })}
      {!inNativeIOSApp && (
        <>
          {' '}
          <Link href='/angebote' key='pledge' passHref legacyBehavior>
            <A>
              <strong>{t('Account/Access/Grants/link/pledges')}</strong>
            </A>
          </Link>
        </>
      )}
    </P> /* End special */
  ) : null
}

export default compose(
  graphql(query, {
    props: ({ data }) => ({
      accessGrants:
        (!data.loading && !data.error && data.me && data.me.accessGrants) || [],
    }),
  }),
  withT,
  withInNativeApp,
)(AccessGrants)
