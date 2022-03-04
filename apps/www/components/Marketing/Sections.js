import React from 'react'
import { css } from 'glamor'

import {
  fontStyles,
  Meta,
  useColorContext,
  mediaQueries,
  FigureImage,
} from '@project-r/styleguide'
import SectionTitle from './Common/SectionTitle'
import SectionContainer from './Common/SectionContainer'
import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import Link from 'next/link'
import NewsletterSignUp from '../Auth/NewsletterSignUp'

const sectionContent = [
  {
    name: 'weekly',
    after: <NewsletterSignUp skipTitle free name='WEEKLY' />,
    href: '/format/wochenend-newsletter',
    color: '#000000',
    borderTop: 'none',
  },
  {
    name: 'briefings',
    href: '/briefings',
    image: '/static/marketing/briefings.png?size=933x933',
    color: '#0A99B8',
    borderTop: 'none',
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
      {sectionContent.map((section, i) => (
        <>
          <div
            key={section.name}
            {...styles.section}
            {...colorScheme.set('borderColor', 'divider')}
            style={{
              borderTop: section.borderTop,
            }}
          >
            {section.image && (
              <div {...styles.picture}>
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
              </div>
            )}
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
              <Meta.P>
                {t(`marketing/page/sections/description/${section.name}`)}
              </Meta.P>
              {section.after}
            </div>
          </div>
        </>
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
