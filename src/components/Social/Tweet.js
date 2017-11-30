import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { link, sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { Figure, FigureImage } from '../Figure'
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
    color: colors.text,
    '& a': {
      ...link
    }
  })
}

const Tweet = ({
  children,
  attributes,
  platform,
  url,
  userName,
  userScreenName,
  date,
  userProfileImageUrl,
  image
}) => {
  return (
    <div {...styles.container}>
      <Header
        url={url}
        userProfileImageUrl={userProfileImageUrl}
        name={userName}
        handle={userScreenName}
        date={date}
      />
      {children && <p {...styles.text} dangerouslySetInnerHTML={
        {__html: children.toString()}
      }/>}
      {image && (
        <Figure>
          <FigureImage src={image} alt='' />
        </Figure>
      )}
    </div>
  )
}

Tweet.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  url: PropTypes.string.isRequired,
  userProfileImageUrl: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userScreenName: PropTypes.string.isRequired,
  date: PropTypes.object.isRequired,
  image: PropTypes.string
}

Tweet.defaultProps = {
  platform: 'twitter'
}

export default Tweet
