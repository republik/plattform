import { useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import AssetImage from '../../../lib/images/AssetImage'

const FutureCampaignHeader = () => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('backgroundColor', 'default')}>
      <div {...styles.header}>
        <Link href='/'>
          <AssetImage
            src={'/static/5-jahre-republik/logo/combo-logo_white.svg'}
            height={32}
            width={160}
            objectFit='contain'
          />
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
    padding: '24px 15px 0 15px',
  }),
}
