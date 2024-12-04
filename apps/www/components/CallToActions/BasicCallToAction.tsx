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
    fullLinkMode = false,
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
    fullLinkMode: boolean
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
      href={fullLinkMode && linkHref}
      {...colorScheme.set('backgroundColor', backgroundColor || 'default')}
      {...colorScheme.set('color', textColor || 'text')}
    >
      <div {...styles.banner} style={{ alignItems: fullLinkMode && 'center' }}>
        {illustration && (
          <img
            {...styles.illustration}
            src={`${CDN_FRONTEND_BASE_URL}/static/cta/${illustration}`}
          />
        )}
        <div {...styles.text}>
          <p>{text}</p>
          {!fullLinkMode && (
            <Link href={linkHref} onClick={() => handleAcknowledge()}>
              {linkLabel}
            </Link>
          )}
        </div>
        <IconButton
          Icon={IconClose}
          style={{ alignSelf: fullLinkMode ? 'center' : 'start' }}
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
    maxWidth: '60ch',
    padding: '2rem 1rem',
  }),
  illustration: css({
    width: 64,
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
    },
    '> a': {
      ...fontStyles.sansSerifMedium16,
      color: 'inherit',
      textDecoration: 'underline',
    },
  }),
}
