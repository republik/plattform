import React, { useMemo } from 'react'
import { css } from 'glamor'

import {
  fontStyles,
  Meta,
  useColorContext,
  mediaQueries,
  FigureImage,
  Editorial,
} from '@project-r/styleguide'
import SectionTitle from './Common/SectionTitle'
import SectionContainer from './Common/SectionContainer'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import Link from 'next/link'

const sectionContent = [
  {
    name: 'weekly',
    Paragraph: ({ t }) => (
      <Meta.P>
        {t(`marketing/page/sections/description/weekly`)}{' '}
        <Link href='/format/wochenend-newsletter' passHref>
          <Editorial.A>{t(`marketing/page/sections/link/weekly`)}</Editorial.A>
        </Link>
      </Meta.P>
    ),
    href: '/format/wochenend-newsletter',
    // image: '/static/marketing/TK.png?size=WxH',
    color: '#000000',
  },
  {
    name: 'briefings',
    href: '/briefings',
    image: '/static/marketing/briefings.png?size=933x933',
    color: '#0A99B8',
  },
  {
    name: 'kolumnen',
    href: '/kolumnen',
    image: '/static/marketing/kolumnen.png?size=2000x2000',
    imageDark: '/static/marketing/kolumnen-dark.png?size=2000x2000',
    color: '#D2933C',
  },
  {
    name: 'serien',
    href: '/serien',
    image: '/static/marketing/serien.png?size=500x500',
    imageDark: '/static/marketing/serien-dark.png?size=500x500',
    color: '#000000',
  },
  {
    name: 'audio',
    href: '/audio',
    image: '/static/marketing/audio.png?size=1426x1426',
    color: '#000000',
  },
]

const Sections = ({ t }) => {
  const [colorScheme] = useColorContext()
  return (
    <SectionContainer maxWidth={720}>
      <SectionTitle
        title={t('marketing/page/sections/title')}
        lead={t('marketing/page/sections/lead')}
      />
      {sectionContent.map((section) => (
        <div
          key={section.name}
          {...styles.section}
          {...colorScheme.set('borderColor', 'divider')}
        >
          <div {...styles.picture}>
            {section.image && (
              <Link href={section.href} passHref>
                <a {...styles.link}>
                  <FigureImage
                    {...FigureImage.utils.getResizedSrcs(
                      `${CDN_FRONTEND_BASE_URL}${section.image}`,
                      80,
                    )}
                    dark={
                      section.imageDark &&
                      FigureImage.utils.getResizedSrcs(
                        `${CDN_FRONTEND_BASE_URL}${section.imageDark}`,
                        80,
                      )
                    }
                  />
                </a>
              </Link>
            )}
          </div>
          <div {...styles.description}>
            <Meta.Subhead
              style={{ marginTop: 0 }}
              {...colorScheme.set('color', section.color, 'format')}
            >
              <Link href={section.href} passHref>
                <a {...styles.link}>
                  {t(`marketing/page/sections/title/${section.name}`)}
                </a>
              </Link>
            </Meta.Subhead>
            {section.Paragraph && <section.Paragraph t={t} />}
            {!section.Paragraph && (
              <Meta.P>
                {t(`marketing/page/sections/description/${section.name}`)}
              </Meta.P>
            )}
          </div>
        </div>
      ))}
    </SectionContainer>
  )
}

const styles = {
  section: css({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'top',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    paddingTop: 28,
    marginBottom: 32,
  }),
  description: css({
    flex: 1,
  }),
  picture: css({
    width: 80,
    height: 80,
    marginRight: 16,
    objectFit: 'cover',
    [mediaQueries.mUp]: {
      marginRight: 36,
    },
  }),
  title: css({
    ...fontStyles.sansSerifRegular22,
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
  descriptionText: {
    ...fontStyles.sansSerifRegular18,
  },
}

export default Sections
