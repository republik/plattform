import React from 'react'
import { css } from 'glamor'

import CloseIcon from 'react-icons/lib/md/close'

import { A, Label } from '@project-r/styleguide'

import { GITHUB_ORG } from '../../../../lib/settings'
import RepoSearch from '../../utils/RepoSearch'

const styles = {
  value: css({
    height: 60,
    marginBottom: 12,
    borderBottom: '1px solid #000',
    paddingRight: 20,
    position: 'relative'
  }),
  valueText: css({
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: 22,
    lineHeight: '40px'
  }),
  x: css({
    position: 'absolute',
    right: 0,
    bottom: 7
  })
}

export default ({ label, value, onChange }) => {
  const onRefChange = item => {
    onChange(
      undefined,
      item
        ? `https://github.com/${item.value.id}`
        : null,
      item
    )
  }
  if (value) {
    return (
      <div {...styles.value}>
        <Label style={{color: '#000'}}>{label}</Label><br />
        <div {...styles.valueText}>
          {String(value)
            .replace('https://github.com/', '')
            .replace(`${GITHUB_ORG}/`, '')}
        </div>
        <A href='#remove' {...styles.x} onClick={(e) => {
          e.preventDefault()
          onRefChange(null)
        }}>
          <CloseIcon size={25} />
        </A>
      </div>
    )
  }
  return <RepoSearch
    label={label}
    onChange={onRefChange}
  />
}
