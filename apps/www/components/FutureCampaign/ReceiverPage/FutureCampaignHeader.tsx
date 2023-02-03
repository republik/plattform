import { useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import AssetImage from '../../../lib/images/AssetImage'
import CombiLogo from '../../../public/static/5-jahre-republik/logo/combo-logo_white.svg'

const FutureCampaignHeader = () => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('backgroundColor', 'default')}>
      <div {...styles.header}>
        <Link href='/'>
          <AssetImage
            src={CombiLogo}
            height={70}
            width={250}
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
    marginBottom: 16,
    padding: '15px 0px 15px 15px',
    height: 80,
  }),
}
