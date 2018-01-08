import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Format } from './Format'
import colors from '../../theme/colors'

const styles = {
  main: css({
    borderTop: `1px solid ${colors.text}`,
    paddingTop: '8px',
    margin: '0 0 30px 0',
    [mUp]: {
      margin: '0 0 40px 0',
      paddingTop: '10px'
    }
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  })
}

const Teaser = ({ children, color, format, interaction, Link }) => {
  return (
    <div {...styles.main} style={{ borderColor: color }}>
      {format && format.meta && (
        <Format color={color}>
          <Link href={format.meta.path} passHref>
            <a {...styles.link} href={format.meta.path}>
              {format.meta.title}
            </a>
          </Link>
        </Format>
      )}
      {children}
    </div>
  )
}

Teaser.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  format: PropTypes.object,
  interaction: PropTypes.bool
}

export default Teaser
