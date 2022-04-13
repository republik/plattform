import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { fontStyles, mediaQueries, RawHtml } from '@project-r/styleguide'
import withT from '../../lib/withT'

const styles = {
  container: css({
    margin: '40px 0 100px',
    ...fontStyles.sansSerifRegular16,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular19,
    },
  }),
}

export default compose(withT)(({ t }) => (
  <div {...styles.container}>
    <RawHtml
      dangerouslySetInnerHTML={{
        __html: t('search/results/empty'),
      }}
    />
  </div>
))
