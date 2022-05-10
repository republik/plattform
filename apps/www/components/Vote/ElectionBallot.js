import PropTypes from 'prop-types'
import { css } from 'glamor'
import ElectionBallotRow from './ElectionBallotRow'
import { isSelected } from './Election'

const styles = {
  table: css({
    width: '100%',
  }),
}

const ElectionBallot = ({
  candidates,
  vote,
  mandatory,
  maxVotes,
  onChange,
  showMeta,
  disabled,
  discussionPath,
  discussionTag,
}) => (
  <div {...styles.table}>
    {candidates.map((candidate, i) => (
      <ElectionBallotRow
        key={candidate.id}
        odd={i % 2}
        candidate={candidate}
        selected={isSelected(candidate, vote)}
        maxVotes={maxVotes}
        mandatory={mandatory.some((c) => candidate.user.id === c.user.id)}
        onChange={onChange}
        disabled={disabled}
        showMeta={showMeta}
        discussionPath={discussionPath}
        discussionTag={discussionTag}
      />
    ))}
  </div>
)

ElectionBallot.propTypes = {
  candidates: PropTypes.array,
  vote: PropTypes.array,
  mandatory: PropTypes.array,
  maxVotes: PropTypes.number,
  onChange: PropTypes.func,
  showMeta: PropTypes.bool,
  disabled: PropTypes.bool,
  discussionPath: PropTypes.string,
  discussionTag: PropTypes.string,
}

ElectionBallot.defaultProps = {
  vote: [],
  mandatory: [],
  maxVotes: 1,
  showMeta: true,
}

export default ElectionBallot
