import * as React from 'react'
import { compose } from 'redux'
import { Field, Label, colors } from '@project-r/styleguide'
import Input from '../../Form/Input'
import * as DateRange from '../../Form/DateRange'
import * as StringArray from '../../Form/StringArray'
import { Container, Tile } from '../../Layout/Grid'
import * as debounce from 'debounce'
import CSVDownloader from './CsvDownloader'

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
  onSelectCompany: (value: string) => void
  companyName?: string
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

interface Company {
  name: string
  label: string
}

const companies : [Company] = [
  { label: "Project R", name: "PROJECT_R" },
  { label: "Republik AG", name: "REPUBLIK" }
]

export default ({
  search,
  companyName,
  onSearch,
  onSelectCompany,
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
      <div>
        <Label htmlFor="companyName">Choose legal entity:</Label>
      </div>
      <select
        name="companyName"
        value={companyName || companies[0].name}
        onChange={searchHandler(onSelectCompany)}
        >
        {companies.map(({ name, label }) => (
          <option key={name} value={name}>{label}</option>
        ))}
      </select>
    </div>
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
              'WAITING_FOR_REFUND',
              'PAID',
              'REFUNDED',
              'CANCELLED'
            ]
          ],
          [
            'method',
            [
              'STRIPE',
              'POSTFINANCECARD',
              'PAYPAL',
              'PAYMENTSLIP'
            ]
          ]
        ]}
        stringArray={stringArray}
        onChange={onStringArray}
      />
    </div>
    <div style={formSectionStyles}>
      <CSVDownloader companyName={companyName || companies[0].name} />
    </div>
  </div>
