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
      null,
    )

  /* TODO: Special solution for CLIMATE lab, we know here that atm there is only 
  one reduced campaign. 
  As soon as we have the new access model we should revise this */
  const reducedAccessGrants = getAccessGrants(accessGrants, 'REDUCED')
  const currentReducedAccessGrant =
    reducedAccessGrants.length > 0 && reducedAccessGrants[0]
  const beginAtReduced = new Date(currentReducedAccessGrant.beginAt)

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
  ) : currentReducedAccessGrant ? (
    <P>
      {t.elements('Account/Access/Grants/REDUCED/message/claimed', {
        campaignTitle: currentReducedAccessGrant.campaign.title,
        maxEndAt: (
          <span>
            {dayFormat(
              new Date(beginAtReduced.setMonth(beginAtReduced.getMonth() + 1)),
            )}
          </span>
        ),
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
