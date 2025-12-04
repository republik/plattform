import { colors } from '@project-r/styleguide'
import Input from '../../Form/Input'
import DateRange from '../../Form/DateRange'
import StringArray from '../../Form/StringArray'
import withDebouncedSearch from '../../Form/withDebouncedSearch'

import { useApolloClient } from '@apollo/client'

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
    const apolloClient = useApolloClient()

    return (
      <div
        style={{
          borderBottom: `1px solid ${colors.divider}`,
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
