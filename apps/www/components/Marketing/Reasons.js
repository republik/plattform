import { css } from 'glamor'

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

const Reasons = ({ inNativeApp, reasons }) => {
  const { t } = useTranslation()
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 15px' }}>
      <TeaserFrontTileRow columns={3}>
        {reasons.map((reason) => {
          return (
            <TeaserFrontTile align='top' key={reason.title}>
              <h2 {...styles.title}>{reason.title}</h2>
              <Editorial.P>{reason.text}</Editorial.P>
            </TeaserFrontTile>
          )
        })}
      </TeaserFrontTileRow>
      {!inNativeApp && (
        <div {...styles.buttons}>
          <Link
            href={{ pathname: '/angebote', query: { package: 'ABO' } }}
            passHref
            legacyBehavior
          >
            <Button primary>{t('marketing/join/ABO/button/label')}</Button>
          </Link>
          <Link
            href={{ pathname: '/angebote', query: { package: 'MONTHLY_ABO' } }}
            passHref
            legacyBehavior
          >
            <Button>{t('marketing/join/MONTHLY_ABO/button/label')}</Button>
          </Link>
        </div>
      )}
    </div>
  )
}

const styles = {
  title: css({
    ...fontStyles.sansSerifMedium24,
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
