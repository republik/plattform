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
      return (
        grant.campaign.type === type &&
        grant.campaign.id === 'f35c2fcf-c254-482e-b4fb-5c51a48a13d2'
      )
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
  const reducedMaxEndAt =
    reducedAccessGrants.length > 0 &&
    reducedAccessGrants.reduce(
      (acc, grant) =>
        new Date(grant.endAt) > acc ? new Date(grant.endAt) : acc,
      new Date(),
    )

  return maxEndAt ? (
    <P>
      {t.elements('Account/Access/Grants/message/claimed', {
        maxEndAt: <span>{dayFormat(new Date(maxEndAt))}</span>,
      })}
      {!inNativeIOSApp && (
        <>
          {' '}
          <Link href='/angebote' key='pledge' passHref>
            <A>
              <strong>{t('Account/Access/Grants/link/pledges')}</strong>
            </A>
          </Link>
        </>
      )}
    </P>
  ) : reducedMaxEndAt ? (
    <P>
      {t.elements('Account/Access/Grants/REDUCED/message/claimed', {
        campaignTitle: 'Klimalabor',
        maxEndAt: <span>{dayFormat(new Date(reducedMaxEndAt))}</span>,
      })}
      {!inNativeIOSApp && (
        <>
          {' '}
          <Link href='/angebote' key='pledge' passHref>
            <A>
              <strong>{t('Account/Access/Grants/link/pledges')}</strong>
            </A>
          </Link>
        </>
      )}
    </P>
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
