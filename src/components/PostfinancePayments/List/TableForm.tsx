import * as React from 'react'
import { compose } from 'redux'
import * as debounce from 'debounce'
import { Field, Label, colors } from '@project-r/styleguide'
import Input from '../../Form/Input'
import { Container, Tile } from '../../Layout/Grid'
import * as DateRange from '../../Form/DateRange'

export interface FormProps {
  [key: string]: any
  onSearch: (value: string) => void
  search?: string
  dateRange?: DateRange.Options
  onDateRange?: (value?: DateRange.Options) => void
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
  dateRange,
  onDateRange,
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
        fields={['buchungsdatum', 'valuta', 'createdAt']}
        dateRange={dateRange}
        onChange={onDateRange}
      />
    </div>
  </div>
