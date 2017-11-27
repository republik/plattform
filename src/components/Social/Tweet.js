import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { Figure } from '../Figure'
import Image from '../Figure/Image'
import { Header } from './Header'

const styles = {
  container: css({
    display: 'block',
    textDecoration: 'none',
    borderBottom: `1px solid ${colors.text}`,
    borderTop: `1px solid ${colors.text}`,
    margin: '36px auto',
    paddingTop: '10px',
    position: 'relative',
    maxWidth: '455px',
    [mUp]: {
      margin: '45px auto',
      paddingTop: '10px'
    }
  }),
  text: css({
    ...sansSerifRegular15,
    [mUp]: {
      ...sansSerifRegular18
    },
    color: colors.text
  })
}

const Tweet = ({
  children,
  attributes,
  platform,
  url,
  name,
  handle,
  date,
  profilePicture,
  image
}) => {
  return (
    <div {...styles.container}>
      <Header
        url={url}
        profilePicture={profilePicture}
        name={name}
        handle={handle}
        date={date}
      />
      <p {...styles.text}>{children}</p>
      {image && (
        <Figure>
          <Image data={{src: image, alt: ''}} />
        </Figure>
      )}
    </div>
  )
}

Tweet.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  url: PropTypes.string.isRequired,
  profilePicture: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  handle: PropTypes.string.isRequired,
  date: PropTypes.object.isRequired,
  image: PropTypes.string
}

Tweet.defaultProps = {
  platform: 'twitter'
}

export default Tweet
