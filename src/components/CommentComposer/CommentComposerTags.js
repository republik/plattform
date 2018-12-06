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

const CommentComposerTags = ({ t, tagRequired, tags, value, onChange }) => (
  <div {...styles.root}>
    <div {...styles.title}>
      {t(`styleguide/CommentComposerTags/${tagRequired ? 'tagRequired' : 'noTagRequired'}`)}
    </div>
    <div {...styles.tags}>
    {tags && !!tags.length && tags.map(
      tag => (
        <div {...styles.tag} key={tag.value}>
          <Radio
            value={tag.value}
            checked={value === tag.value}
            onChange={(event) => onChange(event.target.value)}>
            {tag.label}
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
  tags: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    })
  ),
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
}

export default CommentComposerTags
