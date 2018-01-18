import React from 'react'

import { Interaction, A, Label } from '@project-r/styleguide'

import { GITHUB_ORG } from '../../../../lib/settings'
import RepoSearch from '../../utils/RepoSearch'

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
      <div style={{height: 60, marginBottom: 12, borderBottom: '1px solid #000'}}>
        <Label style={{color: '#000'}}>{label}</Label><br />
        <Interaction.P>
          {String(value)
            .replace('https://github.com/', '')
            .replace(`${GITHUB_ORG}/`, '')}
          {' '}
          <A href='#remove' onClick={(e) => {
            e.preventDefault()
            onRefChange(null)
          }}>x</A>
        </Interaction.P>
      </div>
    )
  }
  return <RepoSearch
    label={label}
    onChange={onRefChange}
  />
}
