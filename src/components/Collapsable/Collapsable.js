import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

import { sansSerifRegular14 } from '../Typography/styles'

import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useBoundingClientRect } from '../../lib/useBoundingClientRect'
import { convertStyleToRem, pxToRem } from '../Typography/utils'

const COLLAPSED_HEIGHT = {
  mobile: 180,
  desktop: 240
}

const collapsedBodyStyle = (mobile, desktop) => css({
  overflow: 'hidden',
  maxHeight: mobile,
  [mUp]: {
    maxHeight: desktop
  }
})

const collapsedEditorPreviewStyle = (mobile, desktop) => css({
  position: 'relative',
  minHeight: mobile,
  [mUp]: {
    minHeight: desktop
  },
  '&:before': {
    content: ' ',
    display: 'block',
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: colors.secondaryBg,
    borderTop: `1px solid ${colors.primary}`,
    borderBottom: `1px solid ${colors.primary}`,
    top: mobile,
    [mUp]: {
      top: desktop
    }
  }
})

const styles = {
  body: css({
    position: 'relative'
  }),
  buttonContainer: css({
    position: 'relative',
    borderTop: `1px solid ${colors.divider}`,
    '&::before': {
      position: 'absolute',
      display: 'block',
      content: '""',
      left: 0,
      right: 0,
      top: -61,
      height: 60,
      background: 'linear-gradient(0deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)'
    }
  }),
  button: css({
    ...convertStyleToRem(sansSerifRegular14),
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    display: 'block',
    cursor: 'pointer',
    color: colors.primary,
    height: pxToRem('32px'),
    lineHeight: pxToRem('32px'),
    '@media (hover)': {
      ':hover': {
        color: colors.secondary
      }
    }
  })
}

const Collapsable = ({ t, children, height, threshold, initialVisibility, style, editorPreview }) => {
  /**
   * Measuring the body size (height), so we can determine whether to collapse
   * the body.
   *
   * bodyVisibility:
   *   - 'auto': We show the body until measurements can be made and exceed height + threshold
   *   - 'full': The body is collapsable but we're showing the full body.
   *   - 'preview': The body is collapsed.
   */

  const [bodyVisibility, setBodyVisibility] = React.useState(initialVisibility)
  const [bodyRef, bodySize] = useBoundingClientRect([children])
  const isDesktop = useMediaQuery(mUp)
  const { desktop, mobile } = height
  React.useEffect(() => {
    /*
     * Collapse the body (switch to 'preview' visibility) when allowed and the size
     * exceeds the threshold.
     */
    if (bodyVisibility === 'auto' && bodySize.height !== undefined) {
      const maxBodyHeight = isDesktop ? desktop : mobile
      if (bodySize.height > maxBodyHeight + threshold) {
        setBodyVisibility('preview')
      }
    }
  }, [isDesktop, bodyVisibility, bodySize, desktop, mobile, threshold])

  const collapsed = bodyVisibility === 'auto'
    ? undefined
    : bodyVisibility === 'preview'
  const collapseLabel = t && t(`styleguide/Collapsable/${collapsed ? 'expand' : 'collapse'}`)
  const onToggleCollapsed = React.useCallback(() => setBodyVisibility(v => (v === 'preview' ? 'full' : 'preview')), [
    setBodyVisibility
  ])

  return (
    <div {...editorPreview && collapsedEditorPreviewStyle(mobile, desktop)}>
      <div ref={bodyRef}
        {...styles.body}
        {...collapsed && !editorPreview && collapsedBodyStyle(mobile, desktop)}
        style={style}>
        {children}
      </div>

      {bodyVisibility !== 'auto' && !editorPreview && (
        <div {...(collapsed ? styles.buttonContainer : {})}>
          <button {...styles.button} onClick={onToggleCollapsed} title={collapseLabel}>
            {collapseLabel}
          </button>
        </div>
      )}
    </div>
  )
}


Collapsable.propTypes = {
  t: PropTypes.func,
  children: PropTypes.node.isRequired,
  height: PropTypes.shape({
    mobile: PropTypes.number,
    desktop: PropTypes.number
  }),
  initialVisibility: PropTypes.oneOf(['auto', 'full', 'preview']),
  threshold: PropTypes.number,
  style: PropTypes.object,
  editorPreview: PropTypes.bool
}

Collapsable.defaultProps = {
  height: COLLAPSED_HEIGHT,
  initialVisibility: 'auto',
  threshold: 50
}

export default Collapsable
