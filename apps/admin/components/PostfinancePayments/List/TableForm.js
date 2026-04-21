import Input from '@/components/Form/Input'

import withDebouncedSearch from '@/components/Form/withDebouncedSearch'

import Boolean from '@/components/Form/Boolean'
import DateRange from '@/components/Form/DateRange'
import UploadForm from './UploadForm'

const searchHandler = (handler) => (event) => {
  handler(event.target.value)
}

const formSectionStyles = {
  margin: '15px 0 15px 0',
}

export default withDebouncedSearch(
  ({
    search,
    onSearch,
    dateRange,
    onDateRange,
    bool,
    onBool,
    onUpload,
    onRematch,
  }) => (
    <div
      style={{
        borderBottom: `1px solid token(colors.divider)`,
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
          fields={['buchungsdatum', 'valuta', 'createdAt']}
          dateRange={dateRange}
          onChange={onDateRange}
        />
      </div>
      <div style={formSectionStyles}>
        <Boolean.Form fields={['matched']} bool={bool} onChange={onBool} />
      </div>
      <div style={formSectionStyles}>
        <UploadForm onUpload={onUpload} />
        <br />
        <button onClick={onRematch}>Rematch payments</button>
      </div>
    </div>
  ),
)
