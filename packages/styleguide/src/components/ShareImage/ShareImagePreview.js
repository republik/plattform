import { css } from 'glamor'
import React, { useEffect, useRef, useState } from 'react'
import colors from '../../theme/colors'
import { fontStyles } from '../../theme/fonts'
import { Label } from '../Typography'
import { PLACEHOLDER_TEXT } from './index'
import { FACEBOOK_CARD_PREVIEW_WIDTH } from './SharePreviewFacebook'
import {
  previewImageStyle,
  TWITTER_CARD_PREVIEW_WIDTH,
} from './SharePreviewTwitter'

export const SHARE_IMAGE_WIDTH = 1200
export const SHARE_IMAGE_HEIGHT = 630
export const SHARE_IMAGE_PADDING = 48

export const socialPreviewStyles = {
  twitter: previewImageStyle,
}

export const socialPreviewWidth = {
  twitter: TWITTER_CARD_PREVIEW_WIDTH,
  facebook: FACEBOOK_CARD_PREVIEW_WIDTH,
}

const styles = {
  container: css({
    position: 'relative',
    width: SHARE_IMAGE_WIDTH,
    height: SHARE_IMAGE_HEIGHT,
    backgroundColor: '#000',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: SHARE_IMAGE_PADDING,
    overflow: 'hidden',
    wordWrap: 'break-word',
  }),
  kolumnenContainer: css({
    alignItems: 'flex-end',
  }),
  textContainer: css({
    width: '100%',
    maxHeight: SHARE_IMAGE_HEIGHT - 2 * SHARE_IMAGE_PADDING,
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    textAlign: 'center',
    zIndex: 1,
  }),
  formatTitle: css({
    ...fontStyles.sansSerifMedium,
    marginBottom: 18,
    fontSize: 44,
    width: '100%',
    textAlign: 'center',
    zIndex: 1,
  }),
  formatImage: css({
    height: 260,
    zIndex: 1,
  }),
  errorLabel: css({}),
}

const formatFonts = {
  scribble: 'cursiveTitle',
  editorial: 'serifTitle',
  meta: 'sansSerifRegular',
}

const shareImageJustify = {
  top: 'flex-start',
  bottom: 'flex-end',
}

export const SHARE_IMAGE_DEFAULTS = {
  customFontStyle: 'serifTitle',
  textPosition: 'bottom',
  fontSize: 56,
}

const ShareImagePreview = ({
  format,
  text,
  inverted,
  preview,
  fontSize,
  textPosition,
}) => {
  const fontStyle = fontStyles[formatFonts[format?.kind] || 'serifTitle']
  const shareImage =
    format?.shareBackgroundImage &&
    (inverted
      ? format?.shareBackgroundImageInverted || format?.shareBackgroundImage
      : format?.shareBackgroundImage)
  const displayedText = !text || text === '' ? PLACEHOLDER_TEXT : text
  const formatColor = format?.color || colors[format?.kind]
  const socialPreview = socialPreviewStyles[preview]

  const [reservedVerticalSpace, setReservedVerticalSpace] = useState(0)
  const [textContainerOverflow, setTextContainerOverflow] = useState(false)
  const formatImageRef = useRef()
  const formatTitleRef = useRef()
  const textContainerRef = useRef()

  useEffect(() => {
    const formatImageHeight = format?.shareLogo
      ? formatImageRef.current.clientHeight
      : 0
    const formatTitleHeight = format?.title
      ? formatTitleRef.current.clientHeight
      : 0
    setReservedVerticalSpace(formatImageHeight + formatTitleHeight)
  }, [format])

  useEffect(() => {
    setTextContainerOverflow(
      textContainerRef.current.scrollHeight >
        textContainerRef.current.clientHeight,
    )
  }, [text, fontSize])

  const previewWidth = socialPreviewWidth[preview] || (preview && 600)

  return (
    <>
      {preview && textContainerOverflow ? (
        <Label>
          Der Text ist zu gross. Reduziere Schriftgrösse oder Anzahl Zeilen.
        </Label>
      ) : null}
      <div
        {...styles.container}
        {...(previewWidth &&
          css({
            transform: `scale(${previewWidth / SHARE_IMAGE_WIDTH})`,
            transformOrigin: '0 0',
            marginBottom:
              -SHARE_IMAGE_HEIGHT * (1 - previewWidth / SHARE_IMAGE_WIDTH),
          }))}
        {...socialPreview}
        {...(shareImage && styles.kolumnenContainer)}
        style={{
          backgroundImage: shareImage && `url(${shareImage})`,
          backgroundSize: 'cover',
          backgroundColor: inverted ? formatColor : '#FFF',
          justifyContent:
            (shareImage &&
              shareImageJustify[
                textPosition || SHARE_IMAGE_DEFAULTS.textPosition
              ]) ||
            'center',
        }}
      >
        {format?.shareLogo && !shareImage && (
          <img
            ref={formatImageRef}
            {...styles.formatImage}
            src={format?.shareLogo}
            alt=''
          />
        )}
        {format?.title && (
          <div
            ref={formatTitleRef}
            {...styles.formatTitle}
            style={{
              color: inverted ? '#FFF' : formatColor,
              width: shareImage && '80%',
            }}
          >
            {format.title}
          </div>
        )}
        <div
          {...styles.textContainer}
          ref={textContainerRef}
          style={{
            ...fontStyle,
            fontSize: fontSize || SHARE_IMAGE_DEFAULTS.fontSize,
            color: inverted ? '#FFF' : '#000',
            width: shareImage && '80%',
            lineHeight: 1.25,
            border:
              preview && textContainerOverflow ? '1px dotted red' : 'none',
            maxHeight:
              SHARE_IMAGE_HEIGHT -
              2 * SHARE_IMAGE_PADDING -
              reservedVerticalSpace,
          }}
        >
          {displayedText}
        </div>
      </div>
    </>
  )
}

export default ShareImagePreview
