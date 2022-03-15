import React, { useMemo } from 'react'
import {
  Interaction,
  Center,
  mediaQueries,
  Button,
  fontStyles,
  Label,
  ColorContextProvider,
  useColorContext,
  RawHtml,
} from '@project-r/styleguide'
import TrialForm from '../Trial/Form'
import { css } from 'glamor'
import { getElementFromSeed } from '../../lib/utils/helpers'
import { trackEvent, trackEventOnClick } from '../../lib/matomo'
import { useRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { t } from '../../lib/withT'
import withInNativeApp from '../../lib/withInNativeApp'
import withMe from '../../lib/apollo/withMe'
import { shouldIgnoreClick } from '../../lib/utils/link'

const styles = {
  banner: css({
    padding: '5px 0',
  }),
  content: css({
    paddingBottom: 0,
    margin: '0.8rem 0 0.8rem 0',
    ':first-of-type': {
      marginTop: 0,
    },
    ':last-child': {
      marginBottom: 0,
    },
  }),
  cta: css({
    marginTop: 10,
  }),
  actions: css({
    display: 'flex',
    flexDirection: 'column',
    [mediaQueries.mUp]: {
      alignItems: 'center',
      flexDirection: 'row',
    },
  }),
  aside: css({
    maxWidth: '50%',
    marginTop: 15,
    ...fontStyles.sansSerifRegular16,
    lineHeight: 1.4,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular18,
      lineHeight: 1.4,
      marginLeft: 30,
      marginTop: 0,
    },
  }),
}

export const TRY_TO_BUY_RATIO = 0.5

const TRY_VARIATIONS = ['tryNote/211027-v1']
const BUY_VARIATIONS = ['payNote/200313-v1']
const IOS_VARIATIONS = ['payNote/ios']

const DEFAULT_BUTTON_TARGET = '/angebote?package=ABO'

const generatePositionedNote = (variation, target, cta, position) => {
  return {
    [position]: {
      content: t(`article/${variation}/${position}`, undefined, ''),
      contentReached: t(
        `article/${variation}/${position}/reached`,
        undefined,
        '',
      ),
      cta: cta,
      button: {
        label: t(`article/${variation}/${position}/buy/button`, undefined, ''),
        link: t(
          `article/${variation}/${position}/buy/button/link`,
          undefined,
          DEFAULT_BUTTON_TARGET,
        ),
      },
      secondary: t(
        `article/${variation}/${position}/secondary/label`,
        undefined,
        '',
      ) && {
        prefix: t(
          `article/${variation}/${position}/secondary/prefix`,
          undefined,
          '',
        ),
        label: t(
          `article/${variation}/${position}/secondary/label`,
          undefined,
          '',
        ),
        link: t(
          `article/${variation}/${position}/secondary/link`,
          undefined,
          '',
        ),
      },
      note: t(`article/${variation}/${position}/note`, undefined, ''),
    },
  }
}

const generateNote = (variation, target, cta) => {
  return {
    key: variation,
    target: target,
    ...generatePositionedNote(variation, target, cta, 'before'),
    ...generatePositionedNote(variation, target, cta, 'after'),
  }
}

const generateNotes = (variations, target, cta) =>
  variations.map((v) => generateNote(v, target, cta))

const predefinedNotes = generateNotes(
  TRY_VARIATIONS,
  {
    hasActiveMembership: false,
    isEligibleForTrial: true,
    inNativeIOSApp: true,
  },
  'trialForm',
)
  .concat(
    generateNotes(
      BUY_VARIATIONS,
      {
        hasActiveMembership: false,
        inNativeIOSApp: false,
      },
      'button',
    ),
  )
  .concat(
    generateNotes(
      IOS_VARIATIONS,
      {
        hasActiveMembership: false,
        isEligibleForTrial: false,
        inNativeIOSApp: true,
      },
      null,
    ),
  )

const isEmpty = (positionedNote) =>
  (!positionedNote.cta ||
    (positionedNote.cta === 'button' && !positionedNote.button.label)) &&
  !positionedNote.content

const meetTarget = (target) => (payNote) =>
  Object.keys(payNote.target).every((key) => {
    return (
      payNote.target[key] === 'any' ||
      payNote.target[key] ===
        (typeof payNote.target[key] === 'boolean' ? !!target[key] : target[key])
    )
  })

const generateKey = (note, index) => {
  return { ...note, key: `custom-${index}` }
}

const isPermissibleIOSCta = (cta) => !cta || cta === 'trialForm'

const disableForIOS = (note) => {
  return {
    ...note,
    target: {
      ...note.target,
      inNativeIOSApp:
        isPermissibleIOSCta(note.before.cta) &&
        isPermissibleIOSCta(note.after.cta)
          ? 'any'
          : false,
    },
  }
}

const hasCta = (cta) => (note) => note.before.cta === cta

const hasTryAndBuyCtas = (notes) =>
  notes.some(hasCta('button')) &&
  notes.some(hasCta('trialForm')) &&
  notes.every((n) => n.before.cta === 'trialForm' || n.before.cta === 'button')

const getPayNote = (
  subject,
  seed,
  tryOrBuy,
  customOnly,
  customPayNotes,
  tryToBuyRatio,
) => {
  const targetedCustomPaynotes = customPayNotes
    .map(generateKey)
    .map(disableForIOS)
    .filter(meetTarget(subject))

  if (customOnly || targetedCustomPaynotes.length)
    return getElementFromSeed(targetedCustomPaynotes, seed)

  const targetedPredefinedNotes = predefinedNotes.filter(
    meetTarget({
      ...subject,
      // tmp: disallow generic trials pending new strategie
      isEligibleForTrial: subject.isEligibleForTrial && subject.inNativeIOSApp,
    }),
  )

  if (!targetedPredefinedNotes.length) return null

  if (hasTryAndBuyCtas(targetedPredefinedNotes)) {
    const desiredCta = tryOrBuy < tryToBuyRatio ? 'trialForm' : 'button'
    const abPredefinedNotes = targetedPredefinedNotes.filter(hasCta(desiredCta))
    return getElementFromSeed(abPredefinedNotes, seed)
  }

  return getElementFromSeed(targetedPredefinedNotes, seed)
}

const BuyButton = ({ payNote, payload }) => {
  const router = useRouter()
  return (
    <Button
      primary
      href={payNote.button.link}
      onClick={trackEventOnClick(
        ['PayNote', `pledge ${payload.position}`, payload.variation],
        () => router.push(payNote.button.link),
      )}
    >
      {payNote.button.label}
    </Button>
  )
}

const SecondaryCta = ({ payNote, payload }) => {
  const [colorScheme] = useColorContext()
  const router = useRouter()
  const linkRule = useMemo(
    () =>
      css({
        '& a': {
          textDecoration: 'none',
          color: colorScheme.getCSSColor('primary'),
          '@media (hover)': {
            ':hover': {
              color: colorScheme.getCSSColor('textSoft'),
            },
          },
        },
      }),
    [colorScheme],
  )
  return (
    <>
      {payNote.secondary && payNote.secondary.link ? (
        <div
          {...styles.aside}
          {...colorScheme.set('color', 'textSoft')}
          {...linkRule}
        >
          <span>{payNote.secondary.prefix} </span>
          <a
            key='secondary'
            href={payNote.secondary.link}
            onClick={trackEventOnClick(
              ['PayNote', `secondary ${payload.position}`, payload.variation],
              () => router.push(payNote.secondary.link),
            )}
          >
            {payNote.secondary.label}
          </a>
        </div>
      ) : null}
    </>
  )
}

const BuyNoteCta = ({ payNote, payload }) => (
  <div {...styles.actions}>
    <BuyButton payNote={payNote} payload={payload} />
    <SecondaryCta payNote={payNote} payload={payload} />
  </div>
)

const TryNoteCta = ({ payload }) => {
  const router = useRouter()
  return (
    <TrialForm
      onSuccess={() => {
        return false
      }}
      payload={payload}
      minimal
    />
  )
}

const PayNoteCta = ({ payNote, payload, hasAccess }) => {
  const router = useRouter()
  return (
    <>
      {payNote.cta ? (
        <div {...styles.cta}>
          {payNote.cta === 'trialForm' ? (
            <TryNoteCta payload={payload} />
          ) : (
            <BuyNoteCta payNote={payNote} payload={payload} />
          )}
          {payNote.note && (
            <div
              style={{ marginTop: 10, marginBottom: 5 }}
              onClick={(e) => {
                if (e.target.nodeName === 'A') {
                  trackEvent([
                    'PayNote',
                    `note ${payload.position}`,
                    payload.variation,
                  ])
                  const href =
                    e.target.getAttribute && e.target.getAttribute('href')
                  if (!shouldIgnoreClick(e) && href && href.startsWith('/')) {
                    e.preventDefault()
                    router.push(href)
                  }
                }
              }}
            >
              <RawHtml
                type={Label}
                dangerouslySetInnerHTML={{
                  __html: hasAccess
                    ? // use about for more info instead of index which is magazin front with access
                      payNote.note.replace('href="/"', 'href="/about"')
                    : payNote.note,
                }}
              />
            </div>
          )}
        </div>
      ) : null}
    </>
  )
}

const PayNoteP = ({ content }) => (
  <Interaction.P
    {...styles.content}
    dangerouslySetInnerHTML={{
      __html: content,
    }}
  />
)

const PayNoteContent = ({ content }) =>
  content ? (
    <>
      {content.split('\n\n').map((c, i) => (
        <PayNoteP key={i} content={c} />
      ))}
    </>
  ) : null

const withDarkContextWhenBefore = (WrappedComponent) => (props) => {
  if (props.position === 'before') {
    return (
      <ColorContextProvider colorSchemeKey='dark'>
        <WrappedComponent {...props} />
      </ColorContextProvider>
    )
  }
  return <WrappedComponent {...props} />
}

export const PayNote = compose(
  withInNativeApp,
  withMe,
  withDarkContextWhenBefore,
)(
  ({
    inNativeIOSApp,
    me,
    hasAccess,
    hasActiveMembership,
    seed,
    tryOrBuy,
    documentId,
    repoId,
    position,
    customPayNotes = [],
    customOnly,
    tryToBuyRatio = TRY_TO_BUY_RATIO,
  }) => {
    const [colorScheme] = useColorContext()
    const { query } = useRouter()
    const subject = {
      inNativeIOSApp,
      isEligibleForTrial: !me || !!query.trialSignup,
      hasActiveMembership,
    }
    const payNote = getPayNote(
      subject,
      seed,
      tryOrBuy,
      customOnly,
      customPayNotes,
      tryToBuyRatio,
    )

    if (!payNote) return null

    const positionedNote = payNote[position]

    if (isEmpty(positionedNote)) return null

    const payload = {
      documentId,
      repoId,
      variation: payNote.key,
      position,
    }
    const isBefore = position === 'before'

    const content =
      positionedNote.cta === 'trialForm' && query.trialSignup === 'success'
        ? t('article/tryNote/thankYou')
        : positionedNote.content

    return (
      <div
        data-hide-if-active-membership='true'
        {...styles.banner}
        {...colorScheme.set('backgroundColor', isBefore ? 'hover' : 'alert')}
      >
        <Center>
          <PayNoteContent content={content} />
          <PayNoteCta
            payNote={positionedNote}
            payload={payload}
            hasAccess={hasAccess}
          />
        </Center>
      </div>
    )
  },
)
