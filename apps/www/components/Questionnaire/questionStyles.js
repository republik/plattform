import { mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  question: css({
    marginTop: 20,
    marginBottom: 40,
  }),
  label: css({
    marginTop: 20,
  }),
  text: css({
    marginBottom: 20,
    lineHeight: 1.4,
    fontWeight: 500,
  }),
  subheadOuter: css({
    margin: '60px 0 20px',
  }),
  subhead: css({
    lineHeight: 1.4,
  }),
  subheadInner: css({
    boxDecorationBreak: 'clone',
    paddingLeft: '0.5rem',
    paddingRight: '0.5rem',
    marginLeft: '-0.25rem',
    position: 'relative',
    color: 'black',
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
  }),
}

export default styles
