import {
  colors,
  fontStyles,
  mediaQueries,
  useColorContext,
  ColorContextProvider,
} from '@project-r/styleguide'

import { css } from 'glamor'

import Frame from '../../Frame'
import CallToAction from '../shared/CallToAction'
import Counter from '../Counter'
import Image from 'next/image'
import ClimateLabTrialform from './ClimateLabTrialForm'
import { useTranslation } from '../../../lib/withT'
import { CDN_FRONTEND_BASE_URL, PUBLIC_BASE_URL } from '../../../lib/constants'
import { climateColors } from '../config'
import ClimateTeaser from '../FrontTeaser/ClimateTeaser'

const LandingPage = () => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  const meta = {
    pageTitle: t('ClimateLandingPage/seo/title'),
    title: t('ClimateLandingPage/seo/title'),
    description: t('ClimateLandingPage/seo/description'),
    image: `${CDN_FRONTEND_BASE_URL}/static/climatelab/wilkommen-zum-klimalabor-social.png`,
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
            <Image
              src='/static/climatelab/klimalabor-illustration.jpeg'
              width={800}
              height={800}
              alt={t('ClimateTeaser/content/altText')}
            />
          </div>
        </div>
        <div {...styles.contentWrapper}>
          <section {...css({ [mediaQueries.mUp]: { marginTop: 200 } })}>
            <h1 {...styles.pageTitle}>
              {t.elements('ClimateLandingPage/content/heading1', {
                br: <br />,
              })}
            </h1>
            <CallToAction>
              {t('ClimateLandingPage/content/callToAction')}
            </CallToAction>
            <div {...css({ [mediaQueries.mUp]: { marginTop: 105 } })}>
              <p {...styles.text}>
                {t('ClimateLandingPage/content/paragraph1')}
              </p>
              <p {...styles.text}>
                {t('ClimateLandingPage/content/paragraph2')}
              </p>
            </div>
          </section>
          <section
            {...css({ marginTop: 40, [mediaQueries.mUp]: { marginTop: 80 } })}
          >
            <ColorContextProvider
              localColorVariables={colors}
              colorSchemeKey='light'
            >
              <ClimateLabTrialform />
            </ColorContextProvider>
          </section>
          <section
            {...css({ marginTop: 40, [mediaQueries.mUp]: { marginTop: 80 } })}
          >
            <Counter />
            <p {...styles.text}>
              {t('ClimateLandingPage/content/counterText')}
            </p>
          </section>
          <section
            {...css({ marginTop: 40, [mediaQueries.mUp]: { marginTop: 80 } })}
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
    width: '80%',
    margin: '0 auto',
    [mediaQueries.mUp]: {
      width: '35vw',
      position: 'sticky',
      top: '15vh',
    },
  }),
  contentWrapper: css({
    flex: '1 1 0',
  }),
  pageTitle: css({
    ...fontStyles.serifTitle,
    fontSize: 30,
    lineHeight: '1.6em',
    [mediaQueries.mUp]: {
      fontSize: 40,
    },
  }),
  text: css({
    ...fontStyles.sansSerifMedium,
    lineHeight: '1.6em',
    fontSize: 24,
    [mediaQueries.mUp]: {
      fontSize: 30,
    },
  }),
}
