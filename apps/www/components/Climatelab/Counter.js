import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { css } from 'glamor'

import {
  mediaQueries,
  fontStyles,
  P,
  Loader,
  useColorContext,
} from '@project-r/styleguide'

import { gql } from '@apollo/client'
import { countFormat } from '../../lib/utils/format'

const styles = {
  container: css({}),
  primaryNumber: css({
    display: 'block',
    marginBottom: -6,
    [mediaQueries.mUp]: {
      marginBottom: -8,
    },
    fontSize: 80,
    ...fontStyles.sansSerifRegular,
    lineHeight: 1,
  }),
}

const query = gql`
  query getRoleCount {
    roleStats(role: "climate") {
      count
    }
  }
`

const Counter = ({ data }) => {
  const [colorScheme] = useColorContext()
  return (
    <Loader
      loading={data.loading}
      error={data.error}
      render={() => {
        const numberClimateUsers = data.roleStats.count || 0

        return (
          <div {...styles.container}>
            <P {...colorScheme.set('color', 'text')}>
              <span {...styles.primaryNumber}>
                {countFormat(numberClimateUsers)}
              </span>
            </P>
          </div>
        )
      }}
    />
  )
}

export default compose(
  graphql(query, {
    options: ({ pollInterval }) => ({
      pollInterval: pollInterval || 0,
    }),
  }),
)(Counter)
