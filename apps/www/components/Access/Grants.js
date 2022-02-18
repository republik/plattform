import React from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

import { Interaction, A } from '@project-r/styleguide'

import { timeFormat } from '../../lib/utils/format'
import Box from '../Frame/Box'
import query from '../Account/belongingsQuery'
import withInNativeApp from '../../lib/withInNativeApp'
import withT from '../../lib/withT'
import Link from 'next/link'

const { P } = Interaction

const dayFormat = timeFormat('%e. %B %Y')

const AccessGrants = ({ accessGrants, inNativeIOSApp, t }) => {
  const maxEndAt =
    accessGrants.length > 0 &&
    accessGrants.reduce(
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
