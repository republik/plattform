import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Format } from './Format'
import colors from '../../theme/colors'
import CalloutMenu from '../Callout/CalloutMenu'

const styles = {
  main: css({
    borderTop: `1px solid ${colors.text}`,
    paddingTop: 8,
    paddingBottom: 30,
    position: 'relative',
    margin: 0,
    [mUp]: {
      paddingBottom: 40,
      paddingTop: '10px'
    }
  }),
  link: css({
    color: 'inherit',
    textDecoration: 'none'
  })
}

const Teaser = ({
  children,
  color,
  format,
  interaction,
  Link,
  highlighted,
  menu
}) => {
  return (
    <div
      {...styles.main}
      style={{
        borderColor: color,
        backgroundColor: highlighted ? colors.primaryBg : undefined
      }}
    >
      {menu && (
        <div
          style={{
            float: 'right'
          }}
        >
          <CalloutMenu align='right'>{menu}</CalloutMenu>
        </div>
      )}
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
  interaction: PropTypes.bool,
  Link: PropTypes.func.isRequired // a react component
}

export default Teaser
