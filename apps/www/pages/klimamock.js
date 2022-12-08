import compose from 'lodash/flowRight'
/* import { useRouter } from 'next/router'
import isEmail from 'validator/lib/isEmail' */

//import { maybeDecode } from '../lib/utils/base64u'
import withT from '../lib/withT'
import { withDefaultSSR } from '../lib/apollo/helpers'

import Frame from '../components/Frame'
import TrialForm from '../components/Trial/Form'

const ALLOWED_CONTEXT = ['claim', 'access']

const LandingPage = ({ t }) => {
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
    title: 'KLIMA!',
    description: 'MACH MIT!',
  }

  return (
    <Frame meta={meta}>
      <TrialForm
        accessCampaignId='3684f324-b694-4930-ad1a-d00a2e00934b'
        context='climate'
        /* payload={{
          
        }} */
      />
    </Frame>
  )
}

export default withDefaultSSR(compose(withT)(LandingPage))
