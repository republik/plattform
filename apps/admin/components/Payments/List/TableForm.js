import DateRange from '@/components/Form/DateRange'
import Input from '@/components/Form/Input'
import StringArray from '@/components/Form/StringArray'
import withDebouncedSearch from '@/components/Form/withDebouncedSearch'

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
    stringArray,
    onStringArray,
  }) => {
    return (
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
                  'CANCELLED',
                ],
              ],
              [
                'method',
                ['STRIPE', 'POSTFINANCECARD', 'PAYPAL', 'PAYMENTSLIP'],
              ],
            ]}
            stringArray={stringArray}
            onChange={onStringArray}
          />
        </div>
      </div>
    )
  },
)
