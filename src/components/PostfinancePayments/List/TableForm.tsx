import * as React from 'react'
import { compose } from 'redux'
import { Field, Label, colors } from '@project-r/styleguide'
import Input from '../../Form/Input'
import { Container, Tile } from '../../Layout/Grid'
import * as debounce from 'debounce'

export interface FormProps {
  [key: string]: any
  onSearch: (value: string) => void
  search?: string
}

const searchHandler = (
  handler: (value: string) => void
) => (event: any) => {
  handler(event.target.value)
}

const formSectionStyles = {
  margin: '15px 0 15px 0'
}

export default ({
  search,
  onSearch,
  ...props
}: FormProps) =>
  <div
    style={{ borderBottom: `1px solid ${colors.divider}` }}
  >
    <div style={formSectionStyles}>
      <Input
        label="Search"
        type="text"
        value={search}
        onChange={searchHandler(onSearch)}
      />
    </div>
    <div style={formSectionStyles}>
      <Input label="From" type="date" />
      <Input label="Until" type="date" />
    </div>
  </div>
