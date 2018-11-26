import React from 'react'
import { colors } from '@project-r/styleguide'
import Input from '../../Form/Input'
import DateRange from '../../Form/DateRange'
import withDebouncedSearch from '../../Form/withDebouncedSearch'

const searchHandler = (
  handler
) => event => {
  handler(event.target.value)
}

const formSectionStyles = {
  margin: '15px 0 15px 0'
}

export default withDebouncedSearch(({
  dateRange,
  onDateRange,
  search,
  onSearch
}) => (
  <div
    style={{
      borderBottom: `1px solid ${colors.divider}`
    }}
  >
    <div style={formSectionStyles}>
      <Input
        label='Search'
        type='text'
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
))
