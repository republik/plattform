import isEmail from 'validator/lib/isEmail'

import { Interaction, Button } from '@project-r/styleguide'

import withMe from '../../lib/apollo/withMe'
import withT from '../../lib/withT'
import * as base64u from '../../lib/utils/base64u'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { DEFAULT_TOKEN_TYPE } from '../constants'

import RawHtmlTranslation from '../RawHtmlTranslation'
import Me from './Me'
import TokenAuthorization from './TokenAuthorization'
import MacNewsletterSubscription from './MacNewsletterSubscription'
import Link from 'next/link'

const { H1, P } = Interaction

const knownTypes = [
  'email-confirmed',
  'invalid-email',
  'invalid-token',
  // Deprecated (superseeded by "newsletter")
  'newsletter-subscription',
  // Deprecated (superseeded by "newsletter")
  // Workaround to handle "script" replacements in email clients
  'newsletter-subscript-disabledion',
  'newsletter',
  'session-denied',
  'token-authorization',
  'unavailable',
]

const AuthNotification = ({ query, goTo, onClose, t, me }) => {
  const { inNativeApp } = useInNativeApp()

  const { context, token, tokenType, noAutoAuthorize } = query
  let { type, email } = query
  if (email !== undefined) {
    try {
      if (base64u.match(email)) {
        email = base64u.decode(email)
      }
    } catch (e) {}

    if (!isEmail(email)) {
      type = 'invalid-email'
      email = ''
    }
  }

  let isUnkownType = false
  let title = t.first(
    [`notifications/${type}/${context}/title`, `notifications/${type}/title`],
    undefined,
    '',
  )
  if (!title && !knownTypes.includes(type)) {
    title = t('notifications/unkown/title')
    isUnkownType = true
  }
  let content
  if (type === 'token-authorization') {
    content = (
      <TokenAuthorization
        email={email}
        token={token}
        tokenType={tokenType || DEFAULT_TOKEN_TYPE}
        noAutoAuthorize={noAutoAuthorize}
        context={context}
        goTo={goTo}
      />
    )
  } else if (
    [
      // Deprecated (superseeded by "newsletter")
      'newsletter-subscription',
      // Deprecated (superseeded by "newsletter")
      // Workaround to handle "script" replacements in email clients
      'newsletter-subscript-disabledion',
      'newsletter',
    ].includes(type)
  ) {
    const { name, subscribed, mac } = query
    title = t.first(
      [
        `notifications/newsletter/name:${name}/title`,
        `notifications/newsletter/title`,
      ],
      undefined,
      '',
    )
    content = (
      <MacNewsletterSubscription
        name={name}
        subscribed={!!subscribed}
        mac={mac}
        email={email}
        context={context}
      />
    )
  } else {
    const afterTokenAuth =
      type === 'email-confirmed' || type === 'session-denied'

    const displayCloseNote =
      !me || ['claim', 'preview', 'access'].includes(context)

    let closeElement = onClose ? (
      <div style={{ marginTop: 20 }}>
        <Button block primary onClick={onClose}>
          {t(`notifications/closeButton${inNativeApp ? '/app' : ''}`)}
        </Button>
      </div>
    ) : afterTokenAuth && displayCloseNote ? (
      <P>{t('notifications/closeNote')}</P>
    ) : (
      (!isUnkownType || inNativeApp) && (
        <div style={{ marginTop: 20 }}>
          <Link href='/' passHref legacyBehavior>
            <Button block primary>
              {t(`notifications/closeButton${inNativeApp ? '/app' : ''}`)}
            </Button>
          </Link>
        </div>
      )
    )

    content = (
      <>
        <P>
          <RawHtmlTranslation
            first={[
              `notifications/${type}/${context}/text`,
              `notifications/${type}/text`,
            ]}
            replacements={query}
            missingValue={isUnkownType ? t('notifications/unkown/text') : ''}
          />
        </P>
        {closeElement}
      </>
    )
  }
  const displayMe =
    type === 'invalid-email' && ['signIn', 'pledge'].indexOf(context) !== -1

  return (
    <>
      {title && (
        <>
          <H1>{title}</H1>
          <br />
        </>
      )}
      {content}
      {displayMe && (
        <div
          style={{
            marginTop: 80,
            marginBottom: 80,
          }}
        >
          <Me email={email} />
        </div>
      )}
    </>
  )
}

export default withMe(withT(AuthNotification))
