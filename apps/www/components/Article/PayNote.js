import { useMemo } from 'react'
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
  shouldIgnoreClick,
} from '@project-r/styleguide'
import TrialForm from '../Trial/Form'
import { css } from 'glamor'
import { getElementFromSeed } from '../../lib/utils/helpers'
import {
  trackEvent,
  trackEventOnClick,
} from '@app/lib/analytics/event-tracking'
import { useRouter } from 'next/router'
import compose from 'lodash/flowRight'
import withT, { t } from '../../lib/withT'
import { useInNativeApp } from '../../lib/withInNativeApp'
import { useMe } from '../../lib/context/MeContext'

const styles = {
  banner: css({
    padding: '5px 0',
    '@media print': {
      display: 'none',
    },
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

const TRY_TO_BUY_RATIO = 0.5

const TRY_VARIATIONS = ['tryNote/220404-v1', 'tryNote/220404-v2']
const BUY_VARIATIONS = ['payNote/220404-v1', 'payNote/220404-v2']
const IOS_VARIATIONS = ['payNote/ios']

export const DEFAULT_BUTTON_TARGET = '/angebote?package=ABO'

export const generatePositionedNote = (variation, cta, position) => {
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
        label: t(
          `article/${variation}/${position}/buy/button`,
          undefined,
          t('article/payNote/default/button'),
        ),
        link: t(
          `article/${variation}/${position}/buy/button/link`,
          undefined,
          DEFAULT_BUTTON_TARGET,
        ),
      },
      secondary: cta === 'button' && {
        prefix: t(
          `article/${variation}/${position}/secondary/prefix`,
          undefined,
          '',
        ),
        label: t(
          `article/${variation}/${position}/secondary/label`,
          undefined,
          t('article/payNote/default/secondary/label'),
        ),
        link: t(
          `article/${variation}/${position}/secondary/link`,
          undefined,
          t('article/payNote/default/secondary/link'),
        ),
      },
      note:
        cta === 'button' &&
        t(
          `article/${variation}/${position}/note`,
          undefined,
          t('article/payNote/default/note'),
        ),
    },
  }
}

const generateNote = (variation, target, cta) => {
  return {
    key: variation,
    target: target,
    ...generatePositionedNote(variation, cta, 'before'),
    ...generatePositionedNote(variation, cta, 'after'),
  }
}

const generateNotes = (variations, target, cta) =>
  variations.map((v) => generateNote(v, target, cta))

const predefinedNotes = generateNotes(
  TRY_VARIATIONS,
  {
    hasActiveMembership: false,
    isEligibleForTrial: true,
    inNativeIOSApp: 'any',
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
  customMode,
) => {
  const targetedCustomPaynotes = customPayNotes
    .map(generateKey)
    .map(disableForIOS)
    .filter(meetTarget(subject))

  if (customOnly || targetedCustomPaynotes.length)
    return getElementFromSeed(targetedCustomPaynotes, seed)

  const targetedPredefinedNotes = predefinedNotes.filter(meetTarget(subject))

  if (!targetedPredefinedNotes.length) return null

  if (hasTryAndBuyCtas(targetedPredefinedNotes)) {
    const desiredCta =
      customMode ?? (tryOrBuy < TRY_TO_BUY_RATIO ? 'trialForm' : 'button')
    const abPredefinedNotes = targetedPredefinedNotes.filter(hasCta(desiredCta))
    return getElementFromSeed(abPredefinedNotes, seed)
  }

  return getElementFromSeed(targetedPredefinedNotes, seed)
}

const BuyButton = withT(({ payNote, payload, t }) => {
  const router = useRouter()
  if (!payNote.button?.link || !payNote.button?.label) return null
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
})

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
  if (!payNote.secondary?.link || !payNote.secondary?.label) return null
  return (
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
  )
}

export const BuyNoteCta = ({ payNote, payload }) => (
  <div {...styles.actions}>
    <BuyButton payNote={payNote} payload={payload} />
    <SecondaryCta payNote={payNote} payload={payload} />
  </div>
)

const TryNoteCta = ({ payload }) => (
  <TrialForm
    onSuccess={() => {
      return false
    }}
    payload={payload}
    minimal
  />
)

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

export const InnerPaynote = ({
  payNote,
  trackingPayload,
  hasAccess,
  overwriteContent,
}) => {
  return (
    <>
      <PayNoteContent content={overwriteContent || payNote.content} />
      <PayNoteCta
        payNote={payNote}
        payload={trackingPayload}
        hasAccess={hasAccess}
      />
    </>
  )
}

export const PayNote = compose(withDarkContextWhenBefore)(
  ({
    seed,
    tryOrBuy,
    documentId,
    repoId,
    position,
    customPayNotes,
    customMode,
    customOnly,
  }) => {
    const { meLoading, hasActiveMembership, hasAccess } = useMe()
    const { inNativeIOSApp } = useInNativeApp()
    const [colorScheme] = useColorContext()
    const { query } = useRouter()

    if (customMode === 'noPaynote') return null

    const subject = {
      inNativeIOSApp,
      isEligibleForTrial: !hasAccess || !!query.trialSignup,
      hasActiveMembership,
    }
    const payNote = getPayNote(
      subject,
      seed,
      tryOrBuy,
      customOnly,
      customPayNotes,
      customMode,
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

    return (
      <div
        data-hide-if-active-membership={meLoading ? 'true' : undefined}
        {...styles.banner}
        {...colorScheme.set(
          'backgroundColor',
          position === 'before' ? 'hover' : 'alert',
        )}
      >
        <Center>
          <InnerPaynote
            payNote={positionedNote}
            overwriteContent={
              positionedNote.cta === 'trialForm' &&
              query.trialSignup === 'success' &&
              t('article/tryNote/thankYou')
            }
            trackingPayload={payload}
            hasAccess={hasAccess}
            position={position}
          />
        </Center>
      </div>
    )
  },
)
