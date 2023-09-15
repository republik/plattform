import { IconClose } from '@republik/icons'
import { css } from 'glamor'
import Link from 'next/link'
import { CTAComponentBaseProps } from '../CustomComponentBase'
import { IconButton, useColorContext } from '@project-r/styleguide'
import { PUBLIC_BASE_URL } from '../../../lib/constants'
import CTAAnimatedBase from '../CTAAnimatedBase'
import withForcedColorScheme from '../../../lib/withForcedColorScheme'

// Ensures that the link is a local link else it returns undefined
function parseLocalLink(href?: unknown): string | undefined {
  if (!href || typeof href !== 'string') return undefined
  if (href.startsWith('/')) return href
  if (href.startsWith(PUBLIC_BASE_URL))
    return href.replace(PUBLIC_BASE_URL, '/')
  return undefined
}
// Link to Datenschutz document (managed in CMS)
const DATENSCHUTZ_URL = '/datenschutz'

const DatenschutzBanner = ({
  id,
  payload,
  handleAcknowledge,
}: CTAComponentBaseProps) => {
  const [colorScheme] = useColorContext()

  const {
    customComponent: { args },
  } = payload
  const linkHref = parseLocalLink(args?.link)

  return (
    <CTAAnimatedBase
      ctaId={id}
      {...colorScheme.set('backgroundColor', 'default')}
      {...colorScheme.set('color', 'text')}
    >
      <div {...styles.banner}>
        <div {...styles.text}>
          <p>
            Wir erweitern unsere Datenschutzbestimmungen, um der
            Urheberrechtsgesellschaft Pro Litteris anonymisierte Zugriffszahlen
            unserer Beiträge übermitteln zu können.
          </p>
          <Link
            href={linkHref || DATENSCHUTZ_URL}
            onClick={() => handleAcknowledge()}
          >
            Wie und warum wir das tun
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
export default withForcedColorScheme(DatenschutzBanner, 'dark')

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
      lineHeight: '1.25',
    },
    '> a': {
      color: 'inherit',
      textDecoration: 'underline',
    },
  }),
}
