import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import Radio from '../../../Form/Radio'
import { mUp } from '../../../../theme/mediaQueries'

const styles = {
  root: css({
    padding: '12px',
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

export const Tags = ({ tags, value, onChange }) => {
  if (!tags || tags.length === 0) {
    return null
  } else {
    return (
      <div {...styles.root}>
        {tags.map(tag => (
          <div {...styles.tag} key={tag}>
            <Radio
              value={tag}
              checked={value === tag}
              onChange={event => onChange(event.target.value)}
            >
              {tag}
            </Radio>
          </div>
        ))}
      </div>
    )
  }
}

Tags.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
}
