import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'
import isEmail from 'validator/lib/isEmail'

import { maybeDecode } from '../lib/utils/base64u'
import withT from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'

import ClaimMembership, {
  sanitizeVoucherCode,
} from '../components/Account/Memberships/Claim'
import Frame from '../components/Frame'

const ALLOWED_CONTEXT = ['claim', 'access']

const Claim = ({ t }) => {
  const { query } = useRouter()
  let { context, email, code, token, id } = query

  context =
    ALLOWED_CONTEXT.includes(context) &&
    (code && code.length === 7 && context === 'access' // ignore access context with 7 digit codes for memberships
      ? undefined
      : context)
  email = email && maybeDecode(email)
  email = email && isEmail(email) ? email : ''
  code = code && sanitizeVoucherCode(code)

  const meta = {
    title: t.first([
      `pages/claim/${context}/meta/title`,
      'pages/claim/meta/title',
    ]),
    description: t.first([
      `pages/claim/${context}/meta/description`,
      'pages/claim/meta/description',
    ]),
  }

  return (
    <Frame meta={meta}>
      <ClaimMembership
        context={context}
        email={email}
        voucherCode={code}
        accessToken={token}
        grantId={id}
      />
    </Frame>
  )
}

export default withDefaultSSR(compose(withT)(Claim))
