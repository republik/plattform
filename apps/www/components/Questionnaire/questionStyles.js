import { mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  label: css({
    marginTop: 20,
  }),
  help: css({
    paddingTop: 15,
  }),
  body: css({
    margin: '5px 0 10px 0',
    minHeight: 75,
    width: '100%',
  }),
  radio: css({
    fontSize: 17,
    lineHeight: 1.1,
    marginTop: -1,
    [mediaQueries.mUp]: {
      fontSize: 21,
      marginTop: -1,
    },  
  })
}

export default styles
