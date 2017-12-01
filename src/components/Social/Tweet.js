import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import {
  link,
  sansSerifRegular15,
  sansSerifRegular18
} from '../Typography/styles'
import { Figure, FigureImage, FigureCaption } from '../Figure'
import { Header } from './Header'
import PlayIcon from 'react-icons/lib/md/play-arrow'

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
  }),
  mediaContainer: css({
    display: 'inline-block',
    position: 'relative'
  }),
  playIcon: css({
    color: '#fff',
    lineHeight: 0,
    position: 'absolute',
    fontSize: '80px',
    left: 'calc(50% - 40px)',
    top: 'calc(50% - 40px)'
  })
}

const Tweet = ({
  attributes,
  html,
  url,
  userName,
  userScreenName,
  date,
  userProfileImageUrl,
  image,
  more,
  playable
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
      <p {...styles.text} dangerouslySetInnerHTML={{ __html: html }} />
      {image && (
        <Figure>
          <a href={url} target="_blank" {...styles.mediaContainer}>
            {playable && <span {...styles.playIcon}><PlayIcon/></span>}
            <FigureImage src={image} alt="" />
          </a>
          {more && (
            <FigureCaption>
              <a href={url} target="_blank" {...css(link)}>
                {more}
              </a>
            </FigureCaption>
          )}
        </Figure>
      )}
    </div>
  )
}

Tweet.propTypes = {
  attributes: PropTypes.object,
  html: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  userProfileImageUrl: PropTypes.string.isRequired,
  userName: PropTypes.string.isRequired,
  userScreenName: PropTypes.string.isRequired,
  date: PropTypes.object.isRequired,
  image: PropTypes.string,
  more: PropTypes.string,
  playable: PropTypes.bool
}

Tweet.defaultProps = {
  platform: 'twitter'
}

export default Tweet
