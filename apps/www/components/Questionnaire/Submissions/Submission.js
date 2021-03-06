import {
  plainButtonRule,
  Editorial,
  Label,
  Interaction,
  pxToRem,
  plainLinkRule,
  RelativeTime,
  useColorContext,
  useHeaderHeight,
  AddIcon,
  RemoveIcon,
  IconButton,
  ShareIcon,
  usePrevious,
} from '@project-r/styleguide'
import { useEffect, useRef, useState } from 'react'
import { max, shuffle } from 'd3-array'
import { css } from 'glamor'
import Link from 'next/link'

import AnswerText from './AnswerText'
import PlainButton from './PlainButton'

import { swissTime } from '../../../lib/utils/format'
import { HEADER_HEIGHT } from '../../constants'
import { useInNativeApp, postMessage } from '../../../lib/withInNativeApp'
import ShareOverlay from '../../ActionBar/ShareOverlay'
import { trackEvent } from '../../../lib/matomo'
import { getSubmissionUrl } from './Share'

const styles = {
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
    justifyContent: 'center',
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

const Submission = ({
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

  const [headerHeight] = useHeaderHeight()
  const hiddenAnswersCount =
    visibleIndexes === true ? 0 : answersCount - visibleIndexes.length
  let lastShownIndex

  const isUpdated = updatedAt && updatedAt !== createdAt

  const rootRef = useRef()
  const publicUrl = getSubmissionUrl(pathname, id)

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
          tweet={sharePayload.tweet || ''}
          emailBody={sharePayload.emailBody || ''}
          eventCategory='SubmissionShare'
        />
      )}
      <div
        {...styles.header}
        style={{ top: headerHeight }}
        {...colorScheme.set(
          'backgroundColor',
          isHighlighted ? 'alert' : 'default',
        )}
      >
        {displayAuthor.profilePicture && (
          <img
            {...styles.headerPicture}
            src={displayAuthor.profilePicture}
            alt=''
          />
        )}
        <div {...styles.headerText}>
          <Interaction.H3>
            {displayAuthor.slug ? (
              <Link href={`/~${displayAuthor.slug}`}>
                <a {...plainLinkRule}>{displayAuthor.name}</a>
              </Link>
            ) : (
              displayAuthor.name
            )}
          </Interaction.H3>
          <Label>
            <span {...colorScheme.set('color', 'textSoft')}>
              <Link href={publicUrl}>
                <a {...styles.linkUnderline} title={titleDate(createdAt)}>
                  <RelativeTime t={t} isDesktop date={createdAt} />
                </a>
              </Link>
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
        <div {...styles.headerActions}>
          <IconButton
            invert={true}
            Icon={isExpanded ? RemoveIcon : AddIcon}
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
      </div>

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
          return (
            <Editorial.P key={id}>
              <strong>{question.text}</strong>
              <br />
              <AnswerText
                text={payload.text}
                value={payload.value}
                question={question}
              />
            </Editorial.P>
          )
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
            Icon={ShareIcon}
            href={publicUrl}
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

export default Submission
