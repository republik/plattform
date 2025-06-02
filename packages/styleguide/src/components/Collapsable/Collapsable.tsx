import React, { useEffect, useState, useMemo, useRef } from 'react'
import { css, merge } from 'glamor'

import { sansSerifRegular14 } from '../Typography/styles'
import { mUp } from '../../theme/mediaQueries'
import scrollIntoView from 'scroll-into-view'
import { useMediaQuery } from '../../lib/useMediaQuery'
import { useBoundingClientRect } from '../../lib/useBoundingClientRect'
import { convertStyleToRem, pxToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'
import { recalculateLazyLoads } from '../LazyLoad'

const COLLAPSED_HEIGHT = {
  mobile: 180,
  desktop: 240,
}

const collapsedBodyStyle = (mobile, desktop) =>
  css({
    overflow: 'hidden',
    maxHeight: mobile,
    [mUp]: {
      maxHeight: desktop,
    },
    '@media print': {
      overflow: 'visible',
      maxHeight: 'none',
    },
  })

const collapsedEditorPreviewStyle = (mobile, desktop) =>
  css({
    position: 'relative',
    minHeight: mobile,
    [mUp]: {
      minHeight: desktop,
    },
    '&:before': {
      content: ' ',
      display: 'block',
      position: 'absolute',
      left: 0,
      bottom: 0,
      right: 0,
      borderWidth: '1px 0px 1px 0px',
      borderBottomStyle: 'solid',
      borderTopStyle: 'solid',
      top: mobile,
      [mUp]: {
        top: desktop,
      },
      '@media print': {
        display: 'none',
      },
    },
  })

type CollapsableProps = {
  t: any
  children: React.ReactNode
  height?: {
    mobile: number
    desktop: number
  }
  initialVisibility?: 'auto' | 'full' | 'preview'
  threshold?: number
  style?: React.CSSProperties
  editorPreview?: boolean
  alwaysCollapsed?: boolean
  isOnOverlay?: boolean
  labelPrefix?: string
}

const Collapsable = ({
  t,
  children,
  height = COLLAPSED_HEIGHT,
  threshold = 50,
  initialVisibility = 'auto',
  style,
  alwaysCollapsed = false,
  editorPreview,
  isOnOverlay,
  labelPrefix,
}: CollapsableProps) => {
  /**
   * Measuring the body size (height), so we can determine whether to collapse
   * the body.
   *
   * bodyVisibility:
   *   - 'auto': We show the body until measurements can be made and exceed height + threshold
   *   - 'full': The body is collapsable but we're showing the full body.
   *   - 'preview': The body is collapsed.
   */

  const [bodyVisibility, setBodyVisibility] = useState(initialVisibility)
  useEffect(() => {
    recalculateLazyLoads()
  }, [bodyVisibility])

  const [bodyRef, bodySize] = useBoundingClientRect([children])
  const [colorScheme] = useColorContext()
  const isDesktop = useMediaQuery(mUp)
  const { desktop, mobile } = height
  useEffect(() => {
    /* In print view the body should always be visible. */
    if (window.matchMedia('print').matches) {
      setBodyVisibility('full')
    } else if (bodyVisibility === 'auto' && bodySize?.height !== undefined) {
      /* Collapse the body (switch to 'preview' visibility) when allowed and the size exceeds the threshold. */
      const maxBodyHeight = isDesktop ? desktop : mobile
      if (bodySize.height > maxBodyHeight + threshold) {
        setBodyVisibility('preview')
      }
    }
  }, [isDesktop, bodyVisibility, bodySize, desktop, mobile, threshold])

  const collapsed =
    bodyVisibility === 'auto' ? undefined : bodyVisibility === 'preview'
  const collapseLabel =
    t &&
    t(
      `styleguide/Collapsable/${labelPrefix ? `${labelPrefix}/` : ''}${
        collapsed ? 'expand' : 'collapse'
      }`,
    )

  const root = useRef<HTMLDivElement>()
  const onToggleCollapsed = React.useCallback(
    () =>
      setBodyVisibility((v) => {
        if (v === 'full') {
          if (root.current?.getBoundingClientRect().top < 0) {
            scrollIntoView(root.current, { time: 0, align: { top: 0 } })
          }
          return 'preview'
        }
        return 'full'
      }),
    [setBodyVisibility],
  )

  const buttonContainerBefore = useMemo(
    () =>
      css({
        '&::before': {
          background: colorScheme.getCSSColor(
            isOnOverlay ? 'fadeOutGradientOverlay' : 'fadeOutGradientDefault',
          ),
        },
      }),
    [colorScheme, isOnOverlay],
  )

  const buttonRules = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor('primary'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft'),
          },
        },
      }),
    [colorScheme],
  )

  const collapsedEditorPreviewRule = useMemo(
    () =>
      css({
        '&:before': {
          backgroundColor: colorScheme.getCSSColor('hover'),
          borderColor: colorScheme.getCSSColor('primary'),
        },
      }),
    [colorScheme],
  )

  return (
    <div
      {...merge(
        editorPreview && collapsedEditorPreviewStyle(mobile, desktop),
        editorPreview && collapsedEditorPreviewRule,
      )}
      ref={root}
    >
      <div
        ref={bodyRef}
        {...styles.body}
        {...(collapsed &&
          !editorPreview &&
          collapsedBodyStyle(mobile, desktop))}
        style={style}
      >
        {children}
      </div>

      {bodyVisibility !== 'auto' && !editorPreview && (
        <div
          {...merge(
            collapsed ? styles.buttonContainer : {},
            collapsed ? buttonContainerBefore : {},
            !alwaysCollapsed && styles.buttonContainerDivider,
            !alwaysCollapsed && colorScheme.set('borderColor', 'divider'),
          )}
        >
          {!alwaysCollapsed && (
            <button
              {...styles.button}
              {...buttonRules}
              onClick={onToggleCollapsed}
              title={collapseLabel}
            >
              {collapseLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  body: css({
    position: 'relative',
  }),
  buttonContainer: css({
    position: 'relative',
    '&::before': {
      position: 'absolute',
      display: 'block',
      content: '""',
      left: 0,
      right: 0,
      top: -60,
      height: 60,
    },
    '@media print': {
      display: 'none',
    },
  }),
  buttonContainerDivider: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    '&::before': {
      top: -61,
    },
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
    height: pxToRem('32px'),
    lineHeight: pxToRem('32px'),
    '@media print': {
      display: 'none',
    },
  }),
}

export default Collapsable
