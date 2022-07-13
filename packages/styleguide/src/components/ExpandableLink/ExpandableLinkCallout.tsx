import React, { useMemo, useEffect, useRef, useState } from 'react'
import { css, keyframes } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import zIndex from '../../theme/zIndex'
import { useColorContext } from '../Colors/useColorContext'
import { useLinkInfoContext } from './LinkInfoContext'
import RawHtml from '../RawHtml'
import { LinkIcon } from '../Icons'
import { fontStyles } from '../Typography'
import { ellipsize } from '../../lib/styleMixins'

type Props = {
  inNativeApp?: boolean
}

const ExpandableLinkP = ({ children, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p {...props} {...styles.contentText} {...colorScheme.set('color', 'text')}>
      {children}
    </p>
  )
}

const fadeIn = keyframes({
  from: {
    opacity: 0,
  },
  to: {
    opacity: 1,
  },
})

const styles = {
  calloutContainer: css({
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: zIndex.callout,
    background: 'rgba(0,0,0,0.5)',
    [mUp]: {
      position: 'fixed',
      top: 'auto',
      right: 'auto',
      bottom: 'auto',
      left: 'auto',
      background: 'transparent',
    },
  }),
  callout: css({
    zIndex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'left',
    padding: '24px 15px',
    [mUp]: {
      width: 500,
      position: 'relative',
      left: 'auto',
      right: 'auto',
      padding: '15px',
    },
  }),
  contentText: css({
    ...fontStyles.sansSerifRegular16,
    margin: '0px 0px 8px 0px',
  }),
  contentLink: css({
    ...ellipsize,
    ...fontStyles.sansSerifRegular16,
    textDecorationLine: 'underline',
    display: 'block',
    width: '100%',
    margin: 0,
  }),
  linkIcon: css({
    marginRight: 8,
  }),
}

const appearUp = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(-5px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
})

const appearDown = keyframes({
  from: {
    opacity: 0,
    transform: 'translateY(5px)',
  },
  to: {
    opacity: 1,
    transform: 'translateY(0)',
  },
})

const ExpandableLinkCallout = ({ inNativeApp }: Props) => {
  const [colorScheme] = useColorContext()
  const [expandedLink, setExpandedLink, timeOutRef] = useLinkInfoContext()
  const [calloutHeight, setCalloutHeight] = useState(400)

  const calloutContainerRef = useRef<HTMLDivElement>()
  const calloutRef = useRef<HTMLDivElement>()
  const calloutRule = useMemo(
    () =>
      css({
        backgroundColor: colorScheme.getCSSColor('overlay'),
        [mUp]: {
          boxShadow: colorScheme.getCSSColor('overlayShadow'),
        },
      }),
    [colorScheme],
  )

  const linkRule = useMemo(
    () =>
      css({
        color: colorScheme.getCSSColor('textSoft'),
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('text'),
          },
        },
      }),
    [colorScheme],
  )

  useEffect(() => {
    if (!calloutRef.current) return
    const resize = () => {
      setCalloutHeight(calloutRef.current.offsetHeight)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
    }
  }, [calloutRef])

  if (!expandedLink) {
    return null
  }

  const slideUp = keyframes({
    from: {
      bottom: -calloutHeight,
    },
    to: {
      bottom: 0,
    },
  })

  return (
    <div
      onMouseEnter={() => {
        clearTimeout(timeOutRef.current)
      }}
      onMouseLeave={() => {
        clearTimeout(timeOutRef.current)
        timeOutRef.current = setTimeout(() => setExpandedLink(undefined), 300)
      }}
      onClick={() => {
        clearTimeout(timeOutRef.current)
        timeOutRef.current = setTimeout(() => setExpandedLink(undefined), 300)
      }}
      ref={calloutContainerRef}
      {...styles.calloutContainer}
      {...css({
        animation: `0.3s ${fadeIn} forwards`,
        [mUp]: {
          animation: `0.3s ${
            expandedLink?.position?.top === 'auto' ? appearUp : appearDown
          } alternate`,
          ...expandedLink?.position,
        },
      })}
    >
      <div
        ref={calloutRef}
        {...styles.callout}
        {...calloutRule}
        {...css({
          animation: `0.3s ${slideUp} forwards`,
          bottom: -calloutHeight,
          paddingBottom: inNativeApp ? '50px' : '24px',
          [mUp]: {
            animation: 'none',
            bottom: 'auto',
          },
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <RawHtml
          type={ExpandableLinkP}
          dangerouslySetInnerHTML={{ __html: expandedLink?.description }}
          error={false}
        />
        <a
          href={expandedLink.href}
          target='_blank'
          {...styles.contentLink}
          {...linkRule}
        >
          <LinkIcon
            size={20}
            {...styles.linkIcon}
            {...colorScheme.set('fill', 'textSoft')}
          />
          {expandedLink?.href}
        </a>
      </div>
    </div>
  )
}

export default ExpandableLinkCallout
