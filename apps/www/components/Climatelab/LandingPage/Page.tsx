import { fontStyles } from '@project-r/styleguide'
import { css } from 'glamor'

import { useMe } from '../../../lib/context/MeContext'
import Frame from '../../Frame'
import { ClimatelabColors } from '../ClimatelabColors'
import Text from '../shared/Text'
import CallToAction from '../shared/CallToAction'
import Heading from '../shared/Heading'
import ClimateLabTrialForm from '../shared/ClimateLabTrialForm'
import Counter from '../Counter'
import TrialForm from '../../Trial/Form'

const ALLOWED_CONTEXT = ['claim', 'access']

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
      containerMaxWidth='1280px'
    >
      <div {...styles.page}>
        <div {...styles.imageWrapper}>
          <img
            {...styles.image}
            src='https://media.tenor.com/CX4EQlnLfT0AAAAd/rick-astley.gif'
          />
        </div>
        <div {...styles.contentWrapper}>
          <section>
            <Heading as='h1'>
              Die Klimakrise ist hier.
              <br />
              Die Lage ist ernst.
            </Heading>
            <CallToAction>Was tun?</CallToAction>
            <Text>
              Es beginnt damit, dass wir an Veränderung glauben. Und verstehen,
              wie sie möglich wird.
            </Text>
            <Text>
              Einen Ort für Austausch und Experimente. Um gemeinsam
              herauszufinden, was das ist: Journalismus, der uns in der
              Klimakrise wirklich weiterbringt.
            </Text>
          </section>
          <section>
            <ClimateLabTrialForm />
          </section>
          <section>
            <Counter />
            <Text>
              Menschen machen schon mit im Klimalabor - jung, alt, Stadt, Land
              und alle dazwischen machens chon mit im Klimalabor
            </Text>
            <p>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga
              excepturi vitae illo deleniti libero aliquam porro modi id, error
              asperiores, voluptas quisquam delectus repellat ex!
            </p>
          </section>
        </div>
      </div>

      <TrialForm
        accessCampaignId='3684f324-b694-4930-ad1a-d00a2e00934b'
        context='climate'
        skipForMembers={false}
        shouldSkipTrialForm={me?.roles.some((role) => role === 'climate')}
        payload={{}}
      />
    </Frame>
  )
}

export default LandingPage

const styles = {
  page: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '5rem',
    color: ClimatelabColors.text,
  }),
  imageWrapper: css({
    flex: '1 1 0',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  }),
  image: css({
    width: '35vw',
    height: 'auto',
    objectFit: 'contain',
    position: 'sticky',
    top: '15vh',
  }),
  contentWrapper: css({
    flex: '1 1 0',
  }),
  heading: css({
    ...fontStyles.serifBold32,
  }),
}
