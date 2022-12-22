import { fontStyles, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'

import { useMe } from '../../../lib/context/MeContext'
import Frame from '../../Frame'
import { ClimatelabColors } from '../ClimatelabColors'
import CallToAction from '../shared/CallToAction'
import Counter from '../Counter'
import TrialForm from '../../Trial/Form'
import Image from 'next/image'
import Button from '../shared/Button'
import { useState } from 'react'
import {
  CLIMATE_LAB_ACCESS_CAMPAIGN_ID,
  CLIMATE_LAB_CONTEXT,
  CLIMATE_LAB_ROLE,
} from '../constants'

const LandingPage = () => {
  /* const { query } = useRouter()
  let { context, email, code, token, id } = query

  context =
    ALLOWED_CONTEXT.includes(context) &&
    (code && code.length === 7 && context === 'access' // ignore access context with 7 digit codes for memberships
      ? undefined
      : context)
  email = email && maybeDecode(email)
  email = email && isEmail(email) ? email : ''
  code = code && sanitizeVoucherCode(code)
*/
  const meta = {
    title: 'Klimalabor',
    description: 'MACH MIT!',
  }
  const { me } = useMe()

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
            <div {...styles.trialFormWrapper}>
              <h3 style={{ color: 'black' }}>Jetzt teilnehmen</h3>
              <TrialForm
                accessCampaignId={CLIMATE_LAB_ACCESS_CAMPAIGN_ID}
                context={CLIMATE_LAB_CONTEXT}
                skipForMembers={false}
                shouldSkipTrialForm={me?.roles.some(
                  (role) => role === CLIMATE_LAB_ROLE,
                )}
                payload={{}}
              />
            </div>
          </section>
          <section
            {...css({ marginTop: 40, [mediaQueries.mUp]: { marginTop: 80 } })}
          >
            <Counter />
            <p {...styles.text}>
              Menschen machen schon mit im Klimalabor - jung, alt, Stadt, Land
              und alle dazwischen machens chon mit im Klimalabor
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
  trialFormWrapper: css({
    backgroundColor: 'white',
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: ClimatelabColors.border,
    padding: 20,
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
