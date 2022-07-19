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
} from '@project-r/styleguide'
import { useRef, useState } from 'react'
import { max } from 'd3-array'
import { css } from 'glamor'
import Link from 'next/link'

import AnswerText from './AnswerText'
import PlainButton from './PlainButton'

import { swissTime } from '../../../lib/utils/format'
import { HEADER_HEIGHT } from '../../constants'

const styles = {
  profileRoot: css({
    position: 'sticky',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    overflowX: 'clip',
    padding: '5px 0',
    margin: '-5px 0',
  }),
  profilePicture: css({
    display: 'block',
    width: pxToRem(40),
    flex: `0 0 40px`,
    height: pxToRem(40),
    marginRight: '15px',
  }),
  center: css({
    marginTop: -3,
    alignSelf: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    flexGrow: 1,
    minWidth: 0,
  }),
  actionsWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    height: pxToRem(40),
  }),
}

const dateTimeFormat = swissTime.format('%d. %B %Y %H:%M')
const titleDate = (string) => dateTimeFormat(new Date(string))

const Submission = ({
  t,
  displayAuthor,
  answers,
  questions,
  createdAt,
  updatedAt,
}) => {
  const [colorScheme] = useColorContext()
  const matchedIndexes = answers.nodes
    .map((answer, index) => (answer.hasMatched ? index : false))
    .filter((d) => d !== false)
  const answersCount = answers.nodes.length

  const defaultVisible = matchedIndexes.length
    ? matchedIndexes
    : [0, 1].slice(0, answersCount) // handle 0 or 1 answer
  const [visibleIndexes, setVisible] = useState(defaultVisible)
  const [isExpanded, setIsExpanded] = useState(true)

  const [headerHeight] = useHeaderHeight()
  const hiddenAnswersCount =
    visibleIndexes === true ? 0 : answersCount - visibleIndexes.length
  let lastShownIndex

  const isUpdated = updatedAt && updatedAt !== createdAt

  const rootRef = useRef()

  return (
    <div ref={rootRef}>
      <div
        {...styles.profileRoot}
        style={{ top: headerHeight }}
        {...colorScheme.set('backgroundColor', 'default')}
      >
        {displayAuthor.profilePicture && (
          <img
            {...styles.profilePicture}
            src={displayAuthor.profilePicture}
            alt=''
          />
        )}
        <div {...styles.center}>
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
              <span title={titleDate(createdAt)}>
                <RelativeTime t={t} isDesktop date={createdAt} />
              </span>
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
        <div {...styles.actionsWrapper}>
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
      {isExpanded && !!hiddenAnswersCount && (
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
    </div>
  )
}

export default Submission
