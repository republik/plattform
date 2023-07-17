import { IconButton, useColorContext } from '@project-r/styleguide'
import { IconClose } from '@republik/icons'
import { css } from 'glamor'
import Link from 'next/link'
import withForcedColorScheme from '../../lib/withForcedColorScheme'
import CTAAnimatedBase from './CTAAnimatedBase'

const BasicCallToAction = ({
  id,
  payload: { linkHref, linkLabel, text },
  handleAcknowledge,
}: {
  id: string
  payload: { text: string; linkHref: string; linkLabel: string }
  handleAcknowledge: () => void
}) => {
  const [colorScheme] = useColorContext()

  return (
    <CTAAnimatedBase
      ctaId={id}
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
    >
      <div {...styles.banner}>
        <div {...styles.text}>
          <p>{text}</p>
          <Link href={linkHref}>
            <a onClick={() => handleAcknowledge()}>{linkLabel}</a>
          </Link>
        </div>
        <IconButton
          Icon={IconClose}
          style={{ alignSelf: 'start' }}
          onClick={() => handleAcknowledge()}
          fillColorName='text'
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
  text: css({
    flexGrow: 1,
    '> p': {
      margin: 0,
      marginBottom: '0.5em',
    },
    '> a': {
      color: 'inherit',
      textDecoration: 'underline',
    },
  }),
}
