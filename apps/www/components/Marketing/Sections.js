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
import { useTranslation } from '../../lib/withT'

const sectionContent = [
  {
    name: 'audio',
    image: '/static/marketing/audio.png?size=1426x1426',
    color: '#000000',
  },
  {
    name: 'briefings',
    image: '/static/marketing/briefings.png?size=933x933',
    color: '#0A99B8',
  },
  {
    name: 'kolumnen',
    image: '/static/marketing/kolumnen.png?size=2000x2000',
    imageDark: '/static/marketing/kolumnen-dark.png?size=2000x2000',
    color: '#D2933C',
  },
  {
    name: 'serien',
    image: '/static/marketing/serien.png?size=500x500',
    imageDark: '/static/marketing/serien-dark.png?size=500x500',
    color: '#000000',
  },
]

const Sections = () => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
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
          {section.image && (
            <div {...styles.picture}>
              <FigureImage
                {...FigureImage.utils.getResizedSrcs(
                  `${CDN_FRONTEND_BASE_URL}${section.image}`,
                  section.imageDark
                    ? `${CDN_FRONTEND_BASE_URL}${section.imageDark}`
                    : undefined,
                  80,
                )}
              />
            </div>
          )}
          <div {...styles.description}>
            <Meta.Subhead
              style={{ marginTop: 0 }}
              {...colorScheme.set('color', section.color, 'format')}
            >
              {section.href ? (
                (<Link href={section.href} passHref {...styles.link}>

                  {t(`marketing/page/sections/title/${section.name}`)}

                </Link>)
              ) : (
                <>{t(`marketing/page/sections/title/${section.name}`)}</>
              )}
            </Meta.Subhead>
            <Meta.P>
              {t(`marketing/page/sections/description/${section.name}`)}
            </Meta.P>
            {section.after}
          </div>
        </div>
      ))}
    </SectionContainer>
  );
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
    '&:nth-child(2)': {
      borderTop: 'none',
    },
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
