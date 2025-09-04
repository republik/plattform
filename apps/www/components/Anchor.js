import { css } from 'glamor'

import { mediaQueries } from '@project-r/styleguide'

import { HEADER_HEIGHT } from './constants'

const styles = {
  anchor: css({
    display: 'block',
    visibility: 'hidden',
    position: 'relative',
    top: -(HEADER_HEIGHT + 5),
  }),
}

const Anchor = ({ id }) => <a {...styles.anchor} id={id} />

export default Anchor
