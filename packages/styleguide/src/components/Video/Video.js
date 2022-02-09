import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { breakoutStyles } from '../Center'
import { FigureCaption } from '../Figure'
import Image from './Image'
import { Meta } from './Meta'
import PlayIcon from '../VideoPlayer/Icons/Play'

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
    },
  }),
  thumbnail: css({
    cursor: 'pointer',
    display: 'inline-block',
    lineHeight: 0,
    position: 'relative',
    width: '100%',
    '::before': {
      position: 'absolute',
      background: 'rgba(0, 0, 0, .6)',
      content: ' ',
      height: '100%',
      width: '100%',
      zIndex: 9,
    },
  }),
  playIcon: css({
    color: '#fff',
    lineHeight: 0,
    position: 'absolute',
    left: 'calc(50% - 13px)',
    top: 'calc(50% - 18px)',
    zIndex: 9,
  }),
  playNote: css({
    position: 'absolute',
    top: 'calc(50% + 18px)',
    left: '50%',
    transform: 'translate(-50%,0)',
    color: '#fff',
    width: '100%',
    maxWidth: 400,
    padding: 10,
    lineHeight: 1.2,
    textAlign: 'center',
    zIndex: 9,
  }),
  embedContainer: css({
    position: 'relative',
    height: 0,
    width: '100%',
    marginBottom: '5px',
  }),
  embedIframe: css({
    position: 'absolute',
    height: '100%',
    width: '100%',
    left: 0,
    top: 0,
  }),
}

const Embed = ({ id, platform, aspectRatio, title }) => {
  let src = ''
  if (platform === 'youtube') {
    src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=true&showinfo=0&rel=0`
  }
  if (platform === 'vimeo') {
    src = `https://player.vimeo.com/video/${id}?autoplay=1`
  }
  return (
    <div
      {...css(styles.embedContainer, {
        paddingBottom: `${100 / aspectRatio}%`,
      })}
    >
      <iframe
        {...styles.embedIframe}
        src={src}
        frameBorder='0'
        title={title}
        allow='autoplay; fullscreen'
        allowFullScreen
      />
    </div>
  )
}

class Video extends Component {
  constructor(props) {
    super(props)
    this.state = {
      embedIframe: false,
    }

    this.handleClick = this.handleClick.bind(this)
  }

  handleClick(e) {
    e.preventDefault()
    this.setState({ embedIframe: true })
  }

  render() {
    const {
      t,
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
      attributes,
    } = this.props
    const { embedIframe } = this.state

    return (
      <figure
        {...attributes}
        {...merge(styles.container, breakoutStyles[size])}
      >
        {!embedIframe && (
          <a {...styles.thumbnail} onClick={this.handleClick}>
            <span {...styles.playIcon}>
              <PlayIcon />
            </span>
            <span {...styles.playNote}>
              {t('styleguide/video/dnt/note', {
                player: t(`styleguide/video/dnt/player/${platform}`),
                platform: t(`styleguide/video/dnt/player/${platform}`),
              })}
            </span>
            <Image src={thumbnail} alt='' aspectRatio={aspectRatio} />
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
  t: PropTypes.func.isRequired,
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
  date: PropTypes.object,
}

Video.defaultProps = {
  t: () => '',
  platform: 'youtube',
  size: undefined,
  showMeta: false,
}

export default Video
