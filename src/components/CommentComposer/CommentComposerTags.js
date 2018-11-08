import React from 'react'
import {css} from 'glamor'
import colors from '../../theme/colors'
import { sansSerifMedium16 } from '../Typography/styles'
import Radio from '../Form/Radio'

const styles = {
  root: css({
    background: colors.secondaryBg,
    padding: '12px'
  }),
  title: css({
    ...sansSerifMedium16,
    lineHeight: '20px',
    color: colors.text,
    marginBottom: 20
  }),
  tags: css({
    display: 'flex',
    flexWrap: 'wrap'
  }),
  tag: css({
    marginRight: 24
  })
}

const CommentComposerTags = ({ label, tags, onChange, value }) => (
  <div {...styles.root}>
    <div {...styles.title}>
      {label}
    </div>
    <div {...styles.tags}>
    {tags && !!tags.length && tags.map(
      tag => (
        <div {...styles.tag}>
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

export default CommentComposerTags
