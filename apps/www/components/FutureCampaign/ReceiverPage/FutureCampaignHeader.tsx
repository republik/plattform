import { useColorContext, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import AssetImage from '../../../lib/images/AssetImage'

const FutureCampaignHeader = () => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('backgroundColor', 'default')}>
      <div {...styles.header}>
        <Link href='/'>
          <div {...styles.logo}>
            <AssetImage
              alt='Logo'
              src={'/static/5-jahre-republik/logo/combo-logo_white.svg'}
              height={48}
              width={240}
              layout='responsive'
              // objectFit='contain'
            />
          </div>
        </Link>
      </div>
    </div>
  )
}

export default FutureCampaignHeader

const styles = {
  header: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    padding: '24px 15px',
  }),
  logo: css({
    width: 160,
    [mediaQueries.mUp]: {
      width: 200,
    },
    ':hover': {
      cursor: 'pointer',
    },
  }),
}
