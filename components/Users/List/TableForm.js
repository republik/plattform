import React from 'react'

import { colors, A, Label, Field } from '@project-r/styleguide'

import withDebouncedSearch from '../../Form/withDebouncedSearch'

export default withDebouncedSearch(({ search, onSearch }) => {
  const onSearchFor = prefix => {
    const [oldPrefix, term] = search.split(':')

    onSearch(`${prefix}:${term || oldPrefix || '<platzender Halter>'}`)
  }

  return (
    <div style={{ borderBottom: `1px solid ${colors.divider}` }}>
      <div style={{ margin: '0 0 30px 0' }}>
        <Field
          label='Suche'
          type='text'
          value={search}
          onChange={(e) => onSearch(e.target.value)} />
        <Label>
          Suche nach ·&nbsp;
          <A href='#' onClick={() => onSearchFor('abo')}>Abo-Nr. (abo:…)</A> ·&nbsp;
          <A href='#' onClick={() => onSearchFor('code')}>Geschenkabo-Code (code:…)</A> ·&nbsp;
          <A href='#' onClick={() => onSearchFor('probe')}>Probelesen-Code. (probe:…)</A> ·&nbsp;
          <A href='#' onClick={() => onSearchFor('hrid')}>Payment HR-ID (hrid:…)</A>
        </Label>
      </div>
    </div>
  )
})
