import React from 'react'

import { colors } from '@project-r/styleguide'
import Input from '../../Form/Input'

import DateRange from '../../Form/DateRange'
import Boolean from '../../Form/Boolean'
import UploadForm from './UploadForm'

const searchHandler = (
  handler: (value: string) => void
) => event => {
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
  bool,
  onBool,
  onUpload,
  onRematch
}) => (
  <div
    style={{
      borderBottom: `1px solid ${colors.divider}`
    }}
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
        fields={[
          'buchungsdatum',
          'valuta',
          'createdAt'
        ]}
        dateRange={dateRange}
        onChange={onDateRange}
      />
    </div>
    <div style={formSectionStyles}>
      <Boolean.Form
        fields={['matched']}
        bool={bool}
        onChange={onBool}
      />
    </div>
    <div style={formSectionStyles}>
      <UploadForm onUpload={onUpload} />
      <button onClick={onRematch}>
        Rematch payments
      </button>
    </div>
  </div>
)
