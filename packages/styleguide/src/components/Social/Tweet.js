import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { A } from '../Typography'
import { sansSerifRegular15, sansSerifRegular18 } from '../Typography/styles'
import { Figure, FigureImage, FigureCaption } from '../Figure'
import { Header } from './Header'
import { PlayIcon } from '../Icons'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'
import RawHtml from '../RawHtml'

const styles = {
  container: css({
    display: 'block',
    textDecoration: 'none',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    margin: '36px auto',
    paddingTop: '10px',
    position: 'relative',
    maxWidth: '455px',
    [mUp]: {
      margin: '45px auto',
      paddingTop: '10px',
    },
  }),
  text: css({
    wordWrap: 'break-word',
    ...convertStyleToRem(sansSerifRegular15),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular18),
    },
  }),
  mediaContainer: css({
    display: 'inline-block',
    position: 'relative',
  }),
  playIcon: css({
    color: '#fff',
    lineHeight: 0,
    position: 'absolute',
    fontSize: '80px',
    left: 'calc(50% - 40px)',
    top: 'calc(50% - 40px)',
  }),
}

const Text = (props) => <p {...styles.text} {...props} />

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
  playable,
}) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderColor', 'text')}
    >
      <Header
        url={url}
        userProfileImageUrl={userProfileImageUrl}
        name={userName}
        handle={userScreenName}
        date={date}
      />
      <RawHtml type={Text} dangerouslySetInnerHTML={{ __html: html }} />
      {image && (
        <Figure>
          <a href={url} {...styles.mediaContainer}>
            {playable && (
              <span {...styles.playIcon}>
                <PlayIcon />
              </span>
            )}
            <FigureImage src={image} alt='' />
          </a>
          {more && (
            <FigureCaption>
              <A href={url}>{more}</A>
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
  playable: PropTypes.bool,
}

Tweet.defaultProps = {
  platform: 'twitter',
}

export default Tweet
