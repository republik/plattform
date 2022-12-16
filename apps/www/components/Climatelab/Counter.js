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

const HEIGHT = 8

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

/* const query = gql`
  TODO: NEW QUERY HERE
` */

const Counter = ({ data }) => {
  const [colorScheme] = useColorContext()

  data = {} // TODO: remove that, only for testing purposes
  return (
    <Loader
      loading={data.loading}
      error={data.error}
      render={() => {
        const numberClimateUsers = 350 // TODO: get number out of data

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

export default compose()(Counter)
/* TODO: as soon as we have query, put that into compose
  graphql(query, {
    options: ({ pollInterval }) => ({
      pollInterval: pollInterval || 0,
    }),
  }), 
*/
