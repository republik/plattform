import { colors, fontStyles, mediaQueries } from '@project-r/styleguide'

import { css } from 'glamor'

import Frame from '../../Frame'
import { ClimatelabColors } from '../ClimatelabColors'
import CallToAction from '../shared/CallToAction'
import Counter from '../Counter'
import Image from 'next/image'
import ClimateLabTrialform from './ClimateLabTrialForm'
import OptionalLocalColorContext from '../../Frame/OptionalLocalColorContext'

const LandingPage = () => {
  const meta = {
    title: 'Klimalabor',
    description: 'MACH MIT!',
  }

  return (
    <Frame
      meta={meta}
      pageBackgroundColor={ClimatelabColors.background}
      containerMaxWidth={1100}
    >
      <div {...styles.page}>
        <div {...styles.imageWrapper}>
          <div {...styles.image}>
            <Image
              src='/static/climatelab/klimalabor-illustration.jpeg'
              width={500}
              height={500}
            />
          </div>
        </div>
        <div {...styles.contentWrapper}>
          <section {...css({ [mediaQueries.mUp]: { marginTop: 200 } })}>
            <h1 {...styles.pageTitle}>
              Die Klimakrise ist hier.
              <br />
              Die Lage ist ernst.
            </h1>
            <CallToAction>Was tun?</CallToAction>
            <div {...css({ [mediaQueries.mUp]: { marginTop: 105 } })}>
              <p {...styles.text}>
                Es beginnt damit, dass wir an Veränderung glauben. Und
                verstehen, wie sie möglich wird.
              </p>
              <p {...styles.text}>
                Einen Ort für Austausch und Experimente. Um gemeinsam
                herauszufinden, was das ist: Journalismus, der uns in der
                Klimakrise wirklich weiterbringt.
              </p>
            </div>
          </section>
          <section {...css({ [mediaQueries.mUp]: { marginTop: 80 } })}>
            <OptionalLocalColorContext localColorVariables={colors}>
              <ClimateLabTrialform />
            </OptionalLocalColorContext>
          </section>
          <section
            {...css({ marginTop: 40, [mediaQueries.mUp]: { marginTop: 80 } })}
          >
            <Counter />
            <p {...styles.text}>Menschen machen schon mit im Klimalabor.</p>
          </section>
          <section
            {...css({ marginTop: 40, [mediaQueries.mUp]: { marginTop: 80 } })}
          >
            <p {...styles.text}>
              Das Klimalabor ist ein Projekt der Republik. Die Republik ist ein
              digitales Magazin für Politik, Wirtschaft, Gesellschaft und
              Kultur. Finanziert von seinen Leserinnen und Lesern.
            </p>
            <br />
            <p {...styles.text}>Fragen, Anregungen? klimalabor@republik.ch</p>
          </section>
        </div>
      </div>
    </Frame>
  )
}

export default LandingPage

const styles = {
  page: css({
    color: ClimatelabColors.text,
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
