import { useEffect, useRef, useMemo } from 'react'
import {
  DEFAULT_FONT_SIZE,
  Overlay,
  OverlayBody,
  OverlayToolbar,
  mediaQueries,
  fontStyles,
  Editorial,
  Collapsable,
  plainButtonRule,
  useColorContext,
} from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import { css } from 'glamor'

import withT from '../../lib/withT'
import { useFontSize } from '../../lib/fontSize'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { IconAdd, IconRemove } from '@republik/icons'

const FONT_SIZE_STEP = 3.2
const MIN_FONT_SIZE = 8
const MAX_FONT_SIZE = 48

const FontSizeOverlay = ({ t, onClose }) => {
  const [fontSize, setFontSize] = useFontSize(DEFAULT_FONT_SIZE)
  const fontPercentage = useRef()
  const [colorScheme] = useColorContext()

  fontPercentage.current = `${Math.round(
    (100 * fontSize) / DEFAULT_FONT_SIZE,
  )}%`

  const trackFontSize = (action) => {
    trackEvent(['FontSize', action, fontPercentage.current])
  }

  useEffect(() => {
    trackFontSize('openOverlay')
    return () => {
      trackFontSize('closeOverlay')
    }
  }, [])

  const increaseFontSize = () =>
    fontSize < MAX_FONT_SIZE && setFontSize(fontSize + FONT_SIZE_STEP)

  const decreaseFontSize = () =>
    fontSize > MIN_FONT_SIZE && setFontSize(fontSize - FONT_SIZE_STEP)

  const resetFontSize = () => setFontSize(DEFAULT_FONT_SIZE)
  const fontSizeRule = useMemo(
    () =>
      css({ fontSize: fontSize, borderColor: colorScheme.getCSSColor('text') }),
    [fontSize, colorScheme],
  )
  return (
    <Overlay onClose={onClose} mUpStyle={{ maxWidth: 375, minHeight: 0 }}>
      <OverlayToolbar
        title={t('article/actionbar/fontSize/title')}
        onClose={onClose}
      />
      <OverlayBody>
        <div {...styles.container}>
          <button
            {...styles.iconButton}
            title={t('article/actionbar/fontSize/decrease')}
            onClick={decreaseFontSize}
          >
            <IconRemove />
          </button>
          <label {...styles.label} {...colorScheme.set('color', 'text')}>
            {fontPercentage.current}
          </label>
          <button
            {...styles.iconButton}
            title={t('article/actionbar/fontSize/increase')}
            onClick={increaseFontSize}
          >
            <IconAdd />
          </button>
          <div {...styles.container}>
            <button
              {...styles.reset}
              {...colorScheme.set('color', 'textSoft')}
              onClick={resetFontSize}
              title={t('article/actionbar/fontSize/reset')}
            >
              {t('article/actionbar/fontSize/reset')}
            </button>
          </div>
        </div>
        <div>
          <p>{t('article/actionbar/fontSize/example')}</p>
          <div {...styles.preview} {...fontSizeRule}>
            <Editorial.Subhead {...styles.subhead}>
              Hinter den Wortbergen
            </Editorial.Subhead>
            <Collapsable t={t} alwaysCollapsed isOnOverlay>
              <Editorial.P {...styles.paragraph}>
                Weit hinten, hinter den Wortbergen, fern der Länder Vokalien und
                Konsonantien leben die Blindtexte. Abgeschieden wohnen sie in
                Buchstabhausen an der Küste des Semantik, eines grossen
                Sprachozeans. Ein kleines Bächlein namens Duden fliesst durch
                ihren Ort und versorgt sie mit den nötigen Regelialien. Es ist
                ein paradiesmatisches Land, in dem einem gebratene Satzteile in
                den Mund fliegen.
              </Editorial.P>
            </Collapsable>
          </div>
        </div>
      </OverlayBody>
    </Overlay>
  )
}

const styles = {
  label: css({
    ...fontStyles.sansSerifRegular17,
  }),
  preview: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
  }),
  subhead: css({
    marginTop: 12,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontSize: '1.1875em',
    lineHeight: '1.25',
    [mediaQueries.mUp]: {
      fontSize: '1.5em',
    },
  }),
  paragraph: css({
    fontSize: '1.0625em',
    lineHeight: '1.578em',
    [mediaQueries.mUp]: {
      fontSize: '1.1875em',
    },
  }),
  iconButton: css(plainButtonRule, {
    fontSize: 24,
    padding: '20px 20px 10px',
  }),
  reset: css(plainButtonRule, {
    ...fontStyles.sansSerifRegular13,
    padding: '0 20px 20px',
  }),
  container: css({
    textAlign: 'center',
  }),
}

export default compose(withT)(FontSizeOverlay)
