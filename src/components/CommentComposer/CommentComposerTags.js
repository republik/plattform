import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'
import colors from '../../theme/colors'
import { sansSerifMedium16 } from '../Typography/styles'
import Radio from '../Form/Radio'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  root: css({
    background: colors.secondaryBg,
    padding: '12px'
  }),
  title: css({
    ...sansSerifMedium16,
    lineHeight: '20px',
    color: colors.text,
    marginBottom: 10
  }),
  tags: css({
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    [mUp]: {
      flexDirection: 'row'
    }
  }),
  tag: css({
    marginRight: 24,
    '& ~ &': {
      marginTop: 5
    },
    [mUp]: {
      '& ~ &': {
        marginTop: 0
      }
    }
  })
}

const CommentComposerTags = ({ tagRequired, tags, value, onChange }) => (
  <div {...styles.root}>
    <div {...styles.tags}>
    {tags && !!tags.length && tags.map(
      tag => (
        <div {...styles.tag} key={tag}>
          <Radio
            value={tag}
            checked={value === tag}
            onChange={(event) => onChange(event.target.value)}>
            {tag}
          </Radio>
        </div>
      )
    )}
    </div>
  </div>
)

CommentComposerTags.propTypes = {
  t: PropTypes.func.isRequired,
  tagRequired: PropTypes.bool,
  tags: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

export default CommentComposerTags
