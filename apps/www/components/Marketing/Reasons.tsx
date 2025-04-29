import { css } from 'glamor'
import { Offers } from '@app/components/paynotes/paynote/paynote-offers'

import {
  TeaserFrontTileRow,
  TeaserFrontTile,
  fontStyles,
  Editorial,
  Button,
  mediaQueries,
} from '@project-r/styleguide'
import Link from 'next/link'
import { useTranslation } from '../../lib/withT'
import { MarketingLandingPageCmsQuery } from '#graphql/cms/__generated__/gql/graphql'

type ReasonsProps = {
  inNativeApp: boolean
  reasons: MarketingLandingPageCmsQuery['marketingLandingPage']['reasons']
}

const Reasons = ({ inNativeApp, reasons }: ReasonsProps) => {
  const { t } = useTranslation()
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 15px' }}>
      <TeaserFrontTileRow columns={3}>
        {reasons.map((reason) => (
          <TeaserFrontTile align='top' key={reason.id}>
            <h2 {...styles.title}>{reason.title}</h2>
            <Editorial.P>{reason.description}</Editorial.P>
          </TeaserFrontTile>
        ))}
      </TeaserFrontTileRow>

      {!inNativeApp && (
        <div
          style={{
            margin: '0 auto',
            maxWidth: '34rem',
          }}
        >
          <Offers />
        </div>
      )}
    </div>
  )
}

const styles = {
  title: css({
    ...fontStyles.sansSerifMedium24,
    marginBlock: '0.8em',
  }),
  buttons: css({
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    flexDirection: 'column',
    '>:first-child': {
      marginBottom: 20,
    },
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      '>:first-child': {
        marginRight: 24,
        marginBottom: 0,
      },
    },
  }),
}

export default Reasons
