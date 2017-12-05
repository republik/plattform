import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Figure, FigureImage, FigureCaption } from '../Figure'
import { Meta } from './Meta'
import PlayIcon from 'react-icons/lib/md/play-arrow'

const styles = {
  container: css({
    display: 'block',
    textDecoration: 'none',
    position: 'relative',
    maxWidth: '455px',
    margin: '36px auto',
    [mUp]: {
      margin: '45px auto'
    }
  }),
  thumbnail: css({
    cursor: 'pointer',
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
  }),
  embedContainer: css({
    position: 'relative',
    height: 0,
    width: '100%',
    marginBottom: '5px'
  }),
  embedIframe: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0
  })
}

export const sizeStyles = {
  default: css({
    maxWidth: '455px'
  }),
  full: css({
    maxWidth: '100%'
  }),
  narrow: css({
    maxWidth: '270px'
  })
}

const Embed = ({ id, platform, aspectRatio, title }) => {
  let src = ''
  if (platform === 'youtube') {
    src = `https://www.youtube.com/embed/${id}?autoplay=true&showinfo=0&rel=0`
  }
  if (platform === 'vimeo') {
    src = `https://player.vimeo.com/video/${id}?autoplay=1`
  }
  return (
    <div
      {...css(styles.embedContainer, {
        paddingBottom: `${100 / aspectRatio}%`
      })}
    >
      <iframe
        {...styles.embedIframe}
        src={src}
        frameBorder="0"
        title={title}
        allowFullScreen
      />
    </div>
  )
}

class Video extends Component {
  constructor(props) {
    super(props)
    this.state = {
      play: false
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    e.preventDefault()
    this.setState({ play: true })
  }

  render() {
    const {
      id,
      url,
      platform,
      title,
      thumbnail,
      aspectRatio,
      size,
      showMeta,
      userName,
      userUrl,
      userProfileImageUrl,
      date
    } = this.props
    const { play } = this.state

    return (
      <div {...css(styles.container, sizeStyles[size])}>
        <Figure>
          {!play && (
            <a {...styles.thumbnail} onClick={this.handleClick}>
              <span {...styles.playIcon}>
                <PlayIcon />
              </span>
              <FigureImage src={thumbnail} alt="" />
            </a>
          )}
          {play && (
            <Embed
              id={id}
              platform={platform}
              aspectRatio={aspectRatio}
              title={title}
            />
          )}
          <FigureCaption>{title}</FigureCaption>
        </Figure>
        {showMeta && (
          <Meta
            url={url}
            platform={platform}
            title={title}
            userProfileImageUrl={userProfileImageUrl}
            userName={userName}
            userUrl={userUrl}
            date={date}
          />
        )}
      </div>
    )
  }
}

Video.propTypes = {
  id: PropTypes.string,
  url: PropTypes.string.isRequired,
  platform: PropTypes.oneOf(['vimeo', 'youtube']).isRequired,
  thumbnail: PropTypes.string.isRequired,
  aspectRatio: PropTypes.number.isRequired,
  size: PropTypes.oneOf(Object.keys(sizeStyles)),
  showMeta: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  userUrl: PropTypes.string,
  userProfileImageUrl: PropTypes.string,
  date: PropTypes.object
}

Video.defaultProps = {
  platform: 'youtube',
  size: 'default',
  showMeta: false
}

export default Video
