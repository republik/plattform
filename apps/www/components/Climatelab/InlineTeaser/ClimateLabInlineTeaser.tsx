import { css } from 'glamor'
import Image from 'next/image'
import Link from 'next/link'
import { fontStyles, mediaQueries, plainLinkRule } from '@project-r/styleguide'
import { useTranslation } from '../../../lib/withT'
import {
  CLIMATE_LAB_IMG_URL,
  CLIMATE_LAB_LANDINGPAGE_URL,
  CLIMATE_LAB_ROLE,
} from '../constants'
import { climateColors } from '../config'
import { useColorContext } from '@project-r/styleguide/src/components/Colors/ColorContext'
import { useMe } from '../../../lib/context/MeContext'

const ClimateLabInlineTeaser = () => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const { me } = useMe()
  const isClimateLabMember = me?.roles?.includes(CLIMATE_LAB_ROLE)

  return (
    <section {...styles.root}>
      <div {...styles.image}>
        <Image
          src={CLIMATE_LAB_IMG_URL}
          alt={t('Climate/Logo/altText')}
          layout='fill'
          width={80}
          height={80}
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div {...styles.textWrapper}>
        <hr {...styles.hr} />
        <p {...styles.heading}>{t('ClimateInlineTeaser/content/title')}</p>
        <p style={{ marginTop: '1rem' }} {...colorScheme.set('color', 'text')}>
          {isClimateLabMember ? (
            <>
              {t('ClimateInlineTeaser/Member/content/text')}{' '}
              <Link href={CLIMATE_LAB_LANDINGPAGE_URL}>
                <a {...plainLinkRule} {...styles.link}>
                  {t('ClimateInlineTeaser/Member/content/link')}
                </a>
              </Link>
              {'.'}
            </>
          ) : (
            <>
              {t('ClimateInlineTeaser/NonMember/content/text')}{' '}
              <Link href={CLIMATE_LAB_LANDINGPAGE_URL}>
                <a {...plainLinkRule} {...styles.link}>
                  {t('ClimateInlineTeaser/NonMember/content/link')}
                </a>
              </Link>
              {'.'}
            </>
          )}
        </p>
      </div>
    </section>
  )
}

export default ClimateLabInlineTeaser

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
    },
  }),
  image: css({
    position: 'relative',
    width: 80,
    height: 80,
    flexShrink: 0,
  }),
  hr: css({
    borderTop: `1px solid ${climateColors.light.default}`,
    margin: 0,
  }),
  heading: css({
    ...fontStyles.sansSerifBold,
    color: climateColors.light.default,
    fontSize: 24,
    lineheight: '1.2em',
    marginTop: '0.25rem',
  }),
  textWrapper: css({
    ...fontStyles.sansSerifRegular,
    fontSize: 18,
    lineHeight: '1.6em',
    '> p': {
      margin: 0,
    },
  }),
  link: css({
    textDecoration: 'underline',
  }),
}
