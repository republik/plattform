import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Format } from './Format'
import CalloutMenu from '../Callout/CalloutMenu'
import MoreIcon from 'react-icons/lib/md/more-vert'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  main: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
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

const MoreIconWithProps = props => (
  <MoreIcon width='calc(1em + 7px)' {...props} />
)

const Teaser = ({
  children,
  formatColor,
  format,
  interaction,
  Link,
  highlighted,
  menu
}) => {
  const [colorScheme] = useColorContext()

  return (
    <div
      {...styles.main}
      {...colorScheme.set('borderColor', formatColor || 'text', 'format')}
      {...(highlighted && colorScheme.set('backgroundColor', 'alert'))}
    >
      {menu && (
        <div
          style={{
            float: 'right'
          }}
        >
          <CalloutMenu Element={MoreIconWithProps} align='right'>
            {menu}
          </CalloutMenu>
        </div>
      )}
      {format && format.meta && (
        <Format color={formatColor}>
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
