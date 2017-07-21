import * as React from 'react'
import { compose } from 'redux'
import { Field, Label, colors } from '@project-r/styleguide'
import Input from '../../Form/Input'
import * as DateRange from '../../Form/DateRange'
import * as StringArray from '../../Form/StringArray'
import { Container, Tile } from '../../Layout/Grid'
import * as debounce from 'debounce'

import {
  SortOptions,
  SortDirection,
  serializeOrderBy,
  deserializeOrderBy
} from '../../../lib/utils/queryParams'

export interface FormProps {
  [key: string]: any
  onSearch: (value: string) => void
  search?: string
  onDateRange: (value?: DateRange.Options) => void
  dateRange?: DateRange.Options
  onStringArray?: (value?: StringArray.Options) => void
  stringArray?: StringArray.Options
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
  stringArray,
  onStringArray,
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
        fields={['dueDate', 'createdAt']}
        dateRange={dateRange}
        onChange={onDateRange}
      />
    </div>
    <div style={formSectionStyles}>
      <StringArray.Form
        fields={[
          [
            'status',
            [
              'WAITING',
              'PAID',
              'WAITING_FOR_REFUND',
              'REFUNDED',
              'CANCELLED'
            ]
          ],
          [
            'method',
            [
              'STRIPE',
              'POSTFINANCE',
              'PAYPAL',
              'PAYMENTSLIP'
            ]
          ]
        ]}
        stringArray={stringArray}
        onChange={onStringArray}
      />
    </div>
  </div>
