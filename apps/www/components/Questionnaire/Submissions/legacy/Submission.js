import {
  plainButtonRule,
  Editorial,
  Label,
  Interaction,
  pxToRem,
  plainLinkRule,
  RelativeTime,
  useColorContext,
  IconButton,
  usePrevious,
} from '@project-r/styleguide'
import { useEffect, useRef, useState } from 'react'
import { max, shuffle } from 'd3-array'
import { css } from 'glamor'
import Link from 'next/link'

import { AnswerText } from '../components/AnswerText'
import PlainButton from './PlainButton'

import { swissTime } from '../../../../lib/utils/format'
import { HEADER_HEIGHT } from '../../../constants'
import { useInNativeApp, postMessage } from '../../../../lib/withInNativeApp'
import ShareOverlay from '../../../ActionBar/ShareOverlay'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { getSubmissionUrl } from './Share'
import { useTranslation } from '../../../../lib/withT'
import {
  IconAdd,
  IconRadioChecked,
  IconRadioUnchecked,
  IconRemove,
  IconShare,
} from '@republik/icons'

export const styles = {
  highlightContainer: css({
    padding: '8px 7px',
    margin: '-8px -7px',
  }),
  header: css({
    position: 'sticky',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    overflowX: 'clip',
    padding: '8px 0 5px',
    margin: '-8px 0 -5px',
  }),
  headerPicture: css({
    display: 'block',
    width: pxToRem(40),
    flex: `0 0 40px`,
    height: pxToRem(40),
    marginRight: '15px',
  }),
  headerText: css({
    marginTop: -3,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexGrow: 1,
    minWidth: 0,
  }),
  linkUnderline: css({
    color: 'inherit',
    textDecoration: 'none',
    '@media (hover)': {
      '[href]:hover': {
        textDecoration: 'underline',
        textDecorationSkip: 'ink',
      },
    },
  }),
  headerActions: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    height: pxToRem(40),
  }),
  footer: css({
    display: 'flex',
    justifyContent: 'space-between',
  }),
}

const dateTimeFormat = swissTime.format('%d. %B %Y %H:%M')
const titleDate = (string) => dateTimeFormat(new Date(string))

export const SubmissionAuthor = ({
  displayAuthor,
  createdAt,
  updatedAt,
  submissionUrl,
  children,
  isHighlighted,
  customStyle = {},
  customStylePicture = {},
}) => {
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()
  const isUpdated = createdAt && updatedAt && updatedAt !== createdAt
  return (
    <div
      {...styles.header}
      style={{ top: 0, ...customStyle }}
      {...colorScheme.set(
        'backgroundColor',
        isHighlighted ? 'alert' : 'default',
      )}
    >
      {displayAuthor.profilePicture && (
        <img
          {...styles.headerPicture}
          style={customStylePicture}
          src={displayAuthor.profilePicture}
          alt=''
        />
      )}
      <div {...styles.headerText}>
        <Interaction.H3>
          {displayAuthor.slug ? (
            <Link href={`/~${displayAuthor.slug}`} {...plainLinkRule}>
              {displayAuthor.name}
            </Link>
          ) : (
            displayAuthor.name
          )}
        </Interaction.H3>
        <Label style={{ paddingRight: '20px' }}>
          <span {...colorScheme.set('color', 'textSoft')}>
            {displayAuthor.credentials}
            {createdAt && !displayAuthor.credentials && (
              <Link
                href={submissionUrl}
                {...styles.linkUnderline}
                title={titleDate(createdAt)}
              >
                <RelativeTime t={t} isDesktop date={createdAt} />
              </Link>
            )}
            {isUpdated && (
              <>
                {' · '}
                <span title={titleDate(updatedAt)}>
                  {t('styleguide/comment/header/updated')}
                </span>
              </>
            )}
          </span>
        </Label>
      </div>
      {children}
    </div>
  )
}

const ChoiceAnswerOption = ({ option, checked }) => {
  const [colorScheme] = useColorContext()
  const Icon = checked ? IconRadioChecked : IconRadioUnchecked
  return (
    <span
      style={{
        marginRight: '2em',
        display: 'inline-flex',
        alignItems: 'center',
      }}
      {...colorScheme.set('color', checked ? 'text' : 'textSoft')}
    >
      {!!Icon && <Icon style={{ marginRight: 7 }} />}
      {option?.label}
    </span>
  )
}

const ChoiceAnswer = ({ question, payload }) => (
  <span>
    {question.options.map((option, i) => (
      <ChoiceAnswerOption
        key={i}
        option={option}
        checked={payload?.value?.includes(option.value)}
      />
    ))}
  </span>
)

export const SubmissionQa = ({ question, payload }) => (
  <Editorial.P attributes={{}}>
    <strong>{question.text}</strong>
    <br />
    {question.__typename === 'QuestionTypeChoice' ? (
      <ChoiceAnswer question={question} payload={payload} />
    ) : (
      <AnswerText
        text={payload.text}
        value={payload.value}
        question={question}
      />
    )}
  </Editorial.P>
)

const SubmissionView = ({
  t,
  id,
  pathname,
  displayAuthor,
  answers,
  questions,
  createdAt,
  updatedAt,
  isHighlighted,
}) => {
  const [colorScheme] = useColorContext()
  const matchedIndexes = answers.nodes
    .map((answer, index) => (answer.hasMatched ? index : false))
    .filter((d) => d !== false)
  const prevMatchedIndexes = usePrevious(matchedIndexes)
  const answersCount = answers.nodes.length

  const defaultVisible = matchedIndexes.length
    ? matchedIndexes
    : [0, 1].slice(0, answersCount) // handle 0 or 1 answer
  const [visibleIndexes, setVisible] = useState(
    isHighlighted ? true : defaultVisible,
  )
  const visibleIndexesString = [].concat(visibleIndexes).join()
  const prevMatchedIndexesString = (prevMatchedIndexes || []).join()
  const defaultVisibleString = defaultVisible.join()
  useEffect(() => {
    if (
      visibleIndexesString === prevMatchedIndexesString &&
      visibleIndexesString !== defaultVisibleString
    ) {
      setVisible(defaultVisibleString.split())
    }
  }, [visibleIndexesString, prevMatchedIndexesString, defaultVisibleString])
  const [isExpanded, setIsExpanded] = useState(true)

  const { inNativeApp } = useInNativeApp()
  const [sharePayload, setSharePayload] = useState()

  const hiddenAnswersCount =
    visibleIndexes === true ? 0 : answersCount - visibleIndexes.length
  let lastShownIndex

  const rootRef = useRef()
  const submissionUrl = getSubmissionUrl(pathname, id)

  return (
    <div
      ref={rootRef}
      {...(isHighlighted && styles.highlightContainer)}
      {...(isHighlighted &&
        isHighlighted &&
        colorScheme.set('backgroundColor', 'alert'))}
    >
      {sharePayload && (
        <ShareOverlay
          onClose={() => setSharePayload()}
          url={sharePayload.url}
          title={sharePayload.dialogTitle}
          emailSubject={sharePayload.emailSubject}
          emailBody={sharePayload.emailBody || ''}
          eventCategory='SubmissionShare'
        />
      )}
      <SubmissionAuthor
        displayAuthor={displayAuthor}
        submissionUrl={submissionUrl}
        createdAt={createdAt}
        updatedAt={updatedAt}
      >
        <div {...styles.headerActions}>
          <IconButton
            invert={true}
            Icon={isExpanded ? IconRemove : IconAdd}
            fillColorName='textSoft'
            size={20}
            onClick={() => {
              setIsExpanded(!isExpanded)
              if (isExpanded) {
                const newY =
                  window.pageYOffset +
                  rootRef.current.getBoundingClientRect().top -
                  HEADER_HEIGHT -
                  10
                if (newY < window.pageYOffset) {
                  window.scrollTo(0, newY)
                }
              }
            }}
            style={{
              marginLeft: 10,
            }}
            label={
              !isExpanded &&
              t.pluralize('questionnaire/submissions/answers', {
                count: answersCount,
              })
            }
          />
        </div>
      </SubmissionAuthor>

      {isExpanded &&
        answers.nodes.map(({ id, question: { id: qid }, payload }, index) => {
          const question = questions.find((q) => q.id === qid)
          const isVisible =
            visibleIndexes === true || visibleIndexes.includes(index)

          if (!isVisible) {
            const prevWasVisible = lastShownIndex === index - 1
            const nextWillBeVisible = visibleIndexes.includes(index + 1)
            if (
              (prevWasVisible ||
                (nextWillBeVisible && lastShownIndex === undefined)) &&
              (matchedIndexes.length || index - 1 !== max(visibleIndexes))
            ) {
              return (
                <div
                  style={{
                    marginTop: prevWasVisible ? -20 : 10,
                    marginBottom: nextWillBeVisible ? -20 : 10,
                  }}
                  key={id}
                >
                  <Label>
                    <button
                      {...plainButtonRule}
                      onClick={() => {
                        setVisible(visibleIndexes.concat(index))
                      }}
                    >
                      […]
                    </button>
                  </Label>
                </div>
              )
            }
            return null
          }
          lastShownIndex = index
          return <SubmissionQa key={id} question={question} payload={payload} />
        })}
      {isExpanded && (
        <div {...styles.footer}>
          {!!hiddenAnswersCount && (
            <PlainButton
              onClick={() => {
                setVisible(true)
              }}
            >
              {t.pluralize('questionnaire/submissions/showAnswers', {
                count: hiddenAnswersCount,
              })}
            </PlainButton>
          )}
          <IconButton
            title={t('article/actionbar/share')}
            label={t('styleguide/CommentActions/share/short')}
            labelShort={t('styleguide/CommentActions/share/short')}
            Icon={IconShare}
            href={submissionUrl}
            onClick={(e) => {
              e.preventDefault()
              const title = t('questionnaire/share/title', {
                name: displayAuthor.name,
              })
              const url = getSubmissionUrl(pathname, id, {
                qid:
                  matchedIndexes.length === 1 &&
                  visibleIndexes[0] === matchedIndexes[0]
                    ? // matched single question – share this
                      answers.nodes[visibleIndexes[0]].question.id
                    : // shuffle on every share click otherwise
                      (
                        shuffle(
                          answers.nodes.filter(
                            (a) => a.question.__typename === 'QuestionTypeText',
                          ),
                        )[0] || shuffle([...answers.nodes])[0]
                      ).question.id,
              })

              const payload = {
                dialogTitle: t('questionnaire/share/dialogTitle'),
                url,
                title,
                subject: title,
              }
              if (inNativeApp) {
                trackEvent(['SubmissionShare', 'native', url])
                postMessage({
                  type: 'share',
                  payload,
                })
                e.target.blur()
              } else {
                setSharePayload(payload)
              }
            }}
          />
        </div>
      )}
    </div>
  )
}

export default SubmissionView
