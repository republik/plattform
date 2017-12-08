import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { breakoutStyles } from '../Center'
import { FigureImage, FigureCaption } from '../Figure'
import { Meta } from './Meta'
import PlayIcon from 'react-icons/lib/md/play-arrow'

const styles = {
  container: css({
    textDecoration: 'none',
    position: 'relative',
    padding: 0,
    margin: 0,
    marginTop: 36,
    marginBottom: 36,
    [mUp]: {
      marginTop: 45,
      marginBottom: 45,
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
      embedIframe: false
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    e.preventDefault()
    this.setState({ embedIframe: true })
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
      date,
      attributes
    } = this.props
    const { embedIframe } = this.state

    return (
      <figure {...attributes} {...merge(styles.container, breakoutStyles[size])}>
          {!embedIframe && (
            <a {...styles.thumbnail} onClick={this.handleClick}>
              <span {...styles.playIcon}>
                <PlayIcon />
              </span>
              <FigureImage src={thumbnail} alt="" />
            </a>
          )}
          {embedIframe && (
            <Embed
              id={id}
              platform={platform}
              aspectRatio={aspectRatio}
              title={title}
            />
          )}
          <FigureCaption>{title}</FigureCaption>
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
      </figure>
    )
  }
}

Video.propTypes = {
  id: PropTypes.string,
  url: PropTypes.string.isRequired,
  platform: PropTypes.oneOf(['vimeo', 'youtube']).isRequired,
  thumbnail: PropTypes.string.isRequired,
  aspectRatio: PropTypes.number.isRequired,
  size: PropTypes.oneOf(Object.keys(breakoutStyles)),
  showMeta: PropTypes.bool.isRequired,
  userName: PropTypes.string,
  userUrl: PropTypes.string,
  userProfileImageUrl: PropTypes.string,
  date: PropTypes.object
}

Video.defaultProps = {
  platform: 'youtube',
  size: undefined,
  showMeta: false
}

export default Video
