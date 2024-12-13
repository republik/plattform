import {
  useColorContext,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import withForcedColorScheme from '../../../lib/withForcedColorScheme'
import { CDN_FRONTEND_BASE_URL } from '../../../lib/constants'

const GiftCallToAction = () => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...colorScheme.set('backgroundColor', '#b7a5ec')}
      {...colorScheme.set('color', '#1e1b27')}
    >
      <div {...styles.banner}>
        <img
          {...styles.illustration}
          src={`${CDN_FRONTEND_BASE_URL}/static/cta/gift.svg`}
        />
        <div {...styles.text}>
          <p>
            Drei Monate als kleine Aufmerksamkeit (CHF 48) oder ein Jahr als
            nachhaltiger Freundschaftsbeweis (CHF 222)
          </p>
          <Link href='https://shop.republik.ch/geschenke?utm_medium=website&utm_source=republik?utm_campaign=weihnachten&utm_content=marketingpage'>
            Verschenken Sie die Republik
          </Link>
        </div>
      </div>
    </div>
  )
}

// export default DatenschutzBanner
export default withForcedColorScheme(GiftCallToAction, 'dark')

const styles = {
  banner: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    margin: '0 auto',
    maxWidth: '64ch',
    padding: '2rem 1rem',
    alignItems: 'center',
  }),
  illustration: css({
    alignSelf: 'start',
    width: 56,
    [mediaQueries.mUp]: {
      width: 80,
    },
  }),
  text: css({
    flexGrow: 1,
    '> p': {
      ...fontStyles.sansSerifRegular16,
      margin: 0,
      marginBottom: '0.5em',
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifRegular18,
      },
    },
    '> a': {
      ...fontStyles.sansSerifMedium16,
      color: 'inherit',
      textDecoration: 'underline',
      [mediaQueries.mUp]: {
        ...fontStyles.sansSerifMedium18,
      },
    },
  }),
}
