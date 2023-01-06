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
      containerMaxWidth={1100}
      customContentColorContext={climateColors}
    >
      <div {...styles.page} {...colorScheme.set('color', 'text')}>
        <div {...styles.imageWrapper}>
          <div {...styles.image}>
            <ClimateLabLogo width={480} height={480} />
          </div>
        </div>
        <div {...styles.contentWrapper}>
          <section
            {...css({ marginTop: 68, [mediaQueries.mUp]: { marginTop: 200 } })}
          >
            <h1 {...styles.pageTitle}>
              {t.elements('ClimateLandingPage/content/heading1', {
                br: <br />,
              })}
              <br />
              {t('ClimateLandingPage/content/callToAction')}
            </h1>
            <div {...css({ [mediaQueries.mUp]: { marginTop: 104 } })}>
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
            <Counter />
            <p {...styles.text}>
              {t('ClimateLandingPage/content/counterText')}
            </p>
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
    [mediaQueries.mUp]: {
      display: 'flex',
      flexDirection: 'row',
      gap: '6rem',
    },
  }),
  imageWrapper: css({
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }),
  image: css({
    height: 'auto',
    objectFit: 'contain',
    maxWidth: '480px',
    width: '90%',
    margin: '0 auto',
    [mediaQueries.mUp]: {
      position: 'sticky',
      top: '15vh',
      width: '100%',
    },
  }),
  contentWrapper: css({
    flex: '1 1 0',
  }),
  pageTitle: css({
    ...fontStyles.serifTitle,
    fontSize: 32,
    lineHeight: '1.6em',
    [mediaQueries.mUp]: {
      fontSize: 40,
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
