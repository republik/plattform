import { useState } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import {
  Checkbox,
  fontStyles,
  mediaQueries,
  Radio,
  useColorContext,
} from '@project-r/styleguide'
import { Strong } from './text'
import CandidateCard from './CandidateCard'
import { IconChevronRight, IconFavorite, IconStars } from '@republik/icons'

const styles = {
  row: css({
    width: '100%',
    padding: '4px 0',
    [mediaQueries.mUp]: {
      padding: '7px 0',
    },
  }),
  summary: css({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...fontStyles.sansSerifRegular16,
    lineHeight: 1.3,
    overflowWrap: 'break-word',
  }),
  summaryInfo: css({
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  }),
  summaryDetail: css({
    [mediaQueries.mUp]: {
      display: 'inline-block',
    },
  }),
  summaryDesktop: css({
    [mediaQueries.onlyS]: {
      display: 'none',
    },
  }),
  icon: css({
    marginLeft: 'auto',
    ...fontStyles.serifTitle22,
    transition: 'transform 0.3s',
    display: 'flex',
    '& :not(:first-child)': {
      marginLeft: 8,
    },
  }),
  selection: css({
    marginLeft: 24,
    paddingRight: 10,
  }),
}

const ElectionBallotRow = ({
  selected = false,
  disabled = false,
  maxVotes = 1,
  expanded = false,
  showMeta = true,
  candidate,
  onChange,
  mandatory,
  discussionPath,
  discussionTag,
  odd,
}) => {
  const [colorScheme] = useColorContext()
  const [isExpanded, setExpanded] = useState(expanded || false)

  const toggleExpanded = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setExpanded((isExpanded) => !isExpanded)
  }

  const SelectionComponent = maxVotes > 1 ? Checkbox : Radio

  const { user: d } = candidate
  const summary = [d.birthyear, d.gender, candidate.city].filter(Boolean)
  const showSummary = !!summary.length

  const isDisabled = maxVotes > 1 && !selected && disabled

  return (
    <div
      {...styles.row}
      {...colorScheme.set('backgroundColor', odd ? 'hover' : 'default')}
      style={{ paddingBottom: isExpanded ? 0 : undefined }}
    >
      <div {...styles.summary}>
        <div {...styles.summaryInfo} onClick={toggleExpanded}>
          <div
            {...styles.icon}
            style={{ transform: isExpanded && 'rotate(90deg)' }}
          >
            <IconChevronRight />
          </div>
          <div>
            <Strong>
              {d.name}
              {candidate.isIncumbent ? ' (bisher)' : ''}
            </Strong>
            {showSummary && <span {...styles.summaryDesktop}>,&nbsp;</span>}
            {showSummary && (
              <div {...styles.summaryDetail}>{summary.join(', ')}</div>
            )}
          </div>
        </div>
        {showMeta && (
          <div {...styles.icon}>
            {candidate.recommendation && <IconStars />}
            {mandatory && <IconFavorite />}
          </div>
        )}
        {onChange && (
          <div {...styles.selection}>
            <SelectionComponent
              disabled={isDisabled}
              checked={selected}
              onChange={() => onChange(candidate)}
            />
          </div>
        )}
      </div>
      {isExpanded && (
        <CandidateCard
          candidate={candidate}
          discussionPath={discussionPath}
          discussionTag={discussionTag}
        />
      )}
    </div>
  )
}

ElectionBallotRow.propTypes = {
  selected: PropTypes.bool,
  disabled: PropTypes.bool,
  maxVotes: PropTypes.number,
  expanded: PropTypes.bool,
  onChange: PropTypes.func,
  candidate: PropTypes.object.isRequired,
  showMeta: PropTypes.bool,
  discussionPath: PropTypes.string,
  discussionTag: PropTypes.string,
}

export default ElectionBallotRow
