import { css } from 'glamor'

import { mediaQueries } from '@project-r/styleguide'

export const styles = {
  section: css({
    marginTop: 40,
  }),
  heading: css({
    marginTop: 40,
  }),
  paragraph: css({
    marginTop: 40,
  }),
  portraitAndDetails: css({
    marginTop: 40,
    [mediaQueries.mUp]: {
      display: 'flex',
    },
  }),
  portrait: css({
    width: 300 / 3,
    height: 400 / 3,
    [mediaQueries.mUp]: {
      width: 300 / 2,
      height: 400 / 2,
    },
  }),
  details: css({
    marginTop: 40,
    marginBottom: 40,
    [mediaQueries.mUp]: {
      marginTop: 0,
      marginLeft: 40,
    },
  }),
  errorMessages: css({
    color: 'var(--color-error)',
    marginTop: 40,
  }),
  button: css({
    marginTop: 40,
    width: 170,
    textAlign: 'center',
  }),
}
