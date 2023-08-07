import {
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
        <div {...styles.contentWrapper}>
          <h1 {...styles.pageTitle}>
            {t.elements('ClimateLandingPage/content/heading1', {
              br: <br />,
              nbsp: <>&nbsp;</>,
            })}
          </h1>
          <section>
            <div>
              <p {...styles.text}>
                {t('ClimateLandingPage/content/paragraph1')}
              </p>
              <p {...styles.text}>
                {t('ClimateLandingPage/content/paragraph2')}
              </p>
              <p {...styles.text}>
                {t('ClimateLandingPage/content/paragraph3')}
              </p>
            </div>
          </section>
          <section>
            <ColorContextProvider colorSchemeKey='light'>
              <ClimateLabTrialform />
            </ColorContextProvider>
          </section>
          <section>
            <Counter
              translations={[
                {
                  key: 'primaryNumber',
                  value: 'Menschen machen im Klimalabor mit',
                },
              ]}
            />
          </section>
          <section>
            <p {...styles.text}>
              {t('ClimateLandingPage/content/byRepublikText')}
            </p>
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
    position: 'relative',
    display: 'grid',
    gridTemplateAreas: `
      'image'
      'content'
    `,
    gap: '4rem',
    [mediaQueries.mUp]: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateAreas: `
        'image content'
      `,
      gap: 0,
    },
    padding: '4rem 0 0 0',
  }),
  imageWrapper: css({
    gridArea: 'image',
    alignSelf: 'start',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    [mediaQueries.mUp]: {
      position: 'sticky',
      top: '10vh',
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
    display: 'flex',
    margin: 'auto',
    flexDirection: 'column',
    gap: '4rem',
    [mediaQueries.mUp]: {
      width: '80%',
    },
  }),
  pageTitle: css({
    ...fontStyles.serifTitle,
    fontSize: 38,
    lineHeight: '1.3em',
    textAlign: 'center',
    margin: '1rem 0 -0.3em 0',
    [mediaQueries.mUp]: {
      fontSize: 48,
      textAlign: 'left',
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
    '&:first-child': { marginTop: 0 },
    '&:last-child': { marginBottom: 0 },
  }),
}
