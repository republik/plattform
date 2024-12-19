import {
  IconButton,
  useColorContext,
  fontStyles,
  mediaQueries,
} from '@project-r/styleguide'
import { IconClose } from '@republik/icons'
import { css } from 'glamor'
import Link from 'next/link'
import withForcedColorScheme from '../../lib/withForcedColorScheme'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'

import CTAAnimatedBase from './CTAAnimatedBase'

const BasicCallToAction = ({
  id,
  payload: {
    linkHref,
    linkLabel,
    text,
    backgroundColor,
    textColor,
    illustration,
  },
  handleAcknowledge,
}: {
  id: string
  payload: {
    text: string
    linkHref: string
    linkLabel: string
    backgroundColor?: string
    textColor?: string
    illustration?: string
  }
  handleAcknowledge: () => void
}) => {
  const [colorScheme] = useColorContext()

  return (
    <CTAAnimatedBase
      ctaId={id}
      {...colorScheme.set('backgroundColor', backgroundColor || 'default')}
      {...colorScheme.set('color', textColor || 'text')}
    >
      <div {...styles.banner}>
        {illustration && (
          <img
            {...styles.illustration}
            src={`${CDN_FRONTEND_BASE_URL}/static/cta/${illustration}`}
          />
        )}
        <div {...styles.text}>
          <p>{text}</p>
            <Link href={linkHref} onClick={() => handleAcknowledge()}>
              {linkLabel}
            </Link>
        </div>
        <IconButton
          Icon={IconClose}
          style={{ alignSelf: 'start' }}
          onClick={() => handleAcknowledge()}
          fillColorName={textColor || 'text'}
        />
      </div>
    </CTAAnimatedBase>
  )
}

// export default DatenschutzBanner
export default withForcedColorScheme(BasicCallToAction, 'dark')

const styles = {
  banner: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
    margin: '0 auto',
    maxWidth: 840,
    padding: '2rem 1rem',
    alignItems: 'center',
    [mediaQueries.mUp]: {
      gap: '2rem',
    },
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
