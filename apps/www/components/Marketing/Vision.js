import { Editorial, mediaQueries } from '@project-r/styleguide'
import SectionContainer from './Common/SectionContainer'
import { css } from 'glamor'
import Link from 'next/link'
import { useTranslation } from '../../lib/withT'

const styles = {
  title: css({
    display: 'block',
    fontSize: 26,
    lineHeight: '32px',
    marginBottom: 22,
    [mediaQueries.mUp]: {
      fontSize: 39,
      lineHeight: '52px',
      marginBottom: 30,
    },
  }),
}

const Vision = () => {
  const { t } = useTranslation()
  return (
    <SectionContainer maxWidth={720}>
      <Editorial.Subhead>
        <span {...styles.title}>{t('marketing/page/vision/headline')}</span>
      </Editorial.Subhead>
      <Editorial.P>{t('marketing/page/vision/paragraph1')}</Editorial.P>
      <Editorial.P>{t('marketing/page/vision/paragraph2')}</Editorial.P>
      <Editorial.P>
        <Link href='/about' passHref legacyBehavior>
          <Editorial.A>{t('marketing/page/vision/more')}</Editorial.A>
        </Link>
      </Editorial.P>
    </SectionContainer>
  );
}

export default Vision
