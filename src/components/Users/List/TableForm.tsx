import * as React from 'react'
import { compose } from 'redux'
import { Field, Label, colors } from '@project-r/styleguide'
import Input from '../../Form/Input'
import { Container, Tile } from '../../Layout/Grid'
import * as DateRange from '../../Form/DateRange'

import * as debounce from 'debounce'

export interface FormProps {
  [key: string]: any
  onSearch: (value: string) => void
  search?: string
  onDateRange: (value?: DateRange.Options) => void
  dateRange?: DateRange.Options
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
  dateRange,
  onDateRange,
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
      <DateRange.Form
        fields={['createdAt']}
        dateRange={dateRange}
        onChange={onDateRange}
      />
    </div>
  </div>
