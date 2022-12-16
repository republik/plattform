/* import { useRouter } from 'next/router'
import isEmail from 'validator/lib/isEmail' */

//import { maybeDecode } from '../lib/utils/base64u'
import { withDefaultSSR } from '../lib/apollo/helpers'

import Frame from '../components/Frame'
import TrialForm from '../components/Trial/Form'
import { useMe } from '../lib/context/MeContext'

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
    title: 'KLIMA!',
    description: 'MACH MIT!',
  }
  const { me } = useMe()

  return (
    <Frame meta={meta}>
      {/* This just handles the case when user is not logged in

      TODO: handle logged in users

      - either extend Trial Form so that logged in users just have a checkbox 
      to subscribe and will be forwared to onboarding page 
      - or handle the two cases here: check if user is logged in and offer a 
      different handling if logged in 
      
      */}
      <TrialForm
        accessCampaignId='3684f324-b694-4930-ad1a-d00a2e00934b'
        context='climate'
        skipForMembers={false}
        shouldSkipTrialForm={me?.roles.some((role) => role === 'climate')}
        /* payload={{
          
        }} */
      />
    </Frame>
  )
}

export default withDefaultSSR(LandingPage)
