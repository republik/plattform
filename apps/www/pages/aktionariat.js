import compose from 'lodash/flowRight'
import withT from '../lib/withT'
import Frame from '../components/Frame'

import { H1, H2, P, A } from '@project-r/styleguide'

import Table from '../components/Shareholder/Table'
import Sunburst, { radius } from '../components/Shareholder/Sunburst'

import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'

const ShareholderPage = ({ t }) => {
  const meta = {
    title: t('shareholder/pageTitle'),
    description: t('shareholder/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/aktionariat.png`,
  }

  return (
    <Frame meta={meta} indented>
      <H1>{t('shareholder/title')}</H1>
      <H2>{t('shareholder/description')}</H2>

      <div style={{ maxWidth: radius * 2, margin: '20px 0' }}>
        <Sunburst />
      </div>

      <H2>{t('shareholder/table/title')}</H2>
      <Table />

      <P>
        {t('shareholder/contact')}
        <br />
        <A href={`mailto:${t('shareholder/contact/email')}`}>
          {t('shareholder/contact/email')}
        </A>
        <br />
        <A href={`tel:${t('shareholder/contact/phone/link')}`}>
          {t('shareholder/contact/phone')}
        </A>
      </P>
    </Frame>
  )
}

export default withDefaultSSR(compose(withT)(ShareholderPage))
