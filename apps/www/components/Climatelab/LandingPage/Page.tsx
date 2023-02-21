import {
  colors,
  fontStyles,
  mediaQueries,
  useColorContext,
  ColorContextProvider,
} from '@project-r/styleguide'

import { css } from 'glamor'

import Frame from '../../Frame'
import Counter from '../Counter'
import ClimateLabTrialform from './ClimateLabTrialForm'
import { useTranslation } from '../../../lib/withT'
import { PUBLIC_BASE_URL } from '../../../lib/constants'
import { climateColors } from '../config'
import { CLIMATE_LAB_SHARE_IMAGE_URL } from '../constants'
import ClimateLabLogo from '../shared/ClimateLabLogo'
import { climateLabTeaserXlBreakpoint } from '../FrontTeaser/ClimateLabTeaser'

const LandingPage = () => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  const meta = {
    pageTitle: t('ClimateLandingPage/seo/title'),
    title: t('ClimateLandingPage/seo/title'),
    description: t('ClimateLandingPage/seo/description'),
    image: CLIMATE_LAB_SHARE_IMAGE_URL,
    url: `${PUBLIC_BASE_URL}/wilkommen-zum-klimalabor`,
  }

  return (
    <Frame
      meta={meta}
      containerMaxWidth={1920}
      customContentColorContext={climateColors}
    >
      <div {...styles.page} {...colorScheme.set('color', 'text')}>
        <div {...styles.imageWrapper}>
          <div {...styles.image}>
            <ClimateLabLogo width={480} height={480} />
          </div>
        </div>
        <div {...styles.titleWrapper}>
          <h1 {...styles.pageTitle}>
            {t.elements('ClimateLandingPage/content/heading1', {
              br: <br />,
            })}
            <br />
            {t('ClimateLandingPage/content/callToAction')}
          </h1>
        </div>
        <div {...styles.contentWrapper}>
          <section>
            <div>
              <p {...styles.text}>
                {t('ClimateLandingPage/content/paragraph1')}
              </p>
              <p {...styles.text}>
                {t('ClimateLandingPage/content/paragraph2')}
              </p>
            </div>
          </section>
          <section
            {...css({ marginTop: 111, [mediaQueries.mUp]: { marginTop: 162 } })}
          >
            <ColorContextProvider
              localColorVariables={colors}
              colorSchemeKey='light'
            >
              <ClimateLabTrialform />
            </ColorContextProvider>
          </section>
          <section
            {...css({ marginTop: 111, [mediaQueries.mUp]: { marginTop: 162 } })}
          >
            <Counter
              translations={[
                {
                  key: 'primaryNumber',
                  value: 'Menschen machen im Klimalabor mit',
                },
              ]}
            />
          </section>
          <section
            {...css({ marginTop: 111, [mediaQueries.mUp]: { marginTop: 162 } })}
          >
            <p {...styles.text}>
              {t('ClimateLandingPage/content/byRepublikText')}
            </p>
            <br />
            <p {...styles.text}>
              {t('ClimateLandingPage/content/questionsText')}
            </p>
          </section>
        </div>
      </div>
    </Frame>
  )
}

export default LandingPage

const styles = {
  page: css({
    display: 'grid',
    gridTemplateAreas: `
      'image'
      'title'
      'content'
    `,
    [mediaQueries.mUp]: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateAreas: `
        'image title'
        'image content'
      `,
      gap: '0 2rem',
    },
  }),
  titleWrapper: css({
    gridArea: 'title',
    marginTop: 38,
    [mediaQueries.mUp]: {
      marginTop: 200,
    },
  }),
  imageWrapper: css({
    gridArea: 'image',
    alignSelf: 'start',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    [mediaQueries.mUp]: {
      position: 'sticky',
      top: '15vh',
    },
  }),
  image: css({
    height: 'auto',
    objectFit: 'contain',
    maxWidth: '480px',
    width: '90%',
    margin: '0 auto',
    [mediaQueries.mUp]: {
      width: '100%',
    },
  }),
  contentWrapper: css({
    gridArea: 'content',
    marginTop: 68,
    [mediaQueries.mUp]: {
      maxWidth: 550,
    },
  }),
  pageTitle: css({
    ...fontStyles.serifTitle,
    fontSize: 32,
    lineHeight: '1.3em',
    textAlign: 'center',
    margin: '0.67em 0',
    [mediaQueries.mUp]: {
      fontSize: 48,
      textAlign: 'left',
      margin: 0,
    },
    ['@media only screen and (min-width: 1350px)']: {
      fontSize: 58,
    },
    [climateLabTeaserXlBreakpoint]: {
      fontSize: 80,
    },
  }),
  text: css({
    ...fontStyles.sansSerifMedium,
    lineHeight: '1.54em',
    fontSize: 23,
    [mediaQueries.mUp]: {
      fontSize: 24,
    },
  }),
}
