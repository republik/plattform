import React, { ReactNode, useMemo } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { Message } from '../Editor/Render/Message'
import renderAsText from '../Editor/Render/text'
import { CustomDescendant } from '../Editor/custom-types'
import { isSlateElement } from '../Editor/Render/helpers'
import { useRenderContext } from '../Editor/Render/Context'

const MAX_CHAR = 2500
export const FLYER_CONTAINER_MAXWIDTH = 700

const styles = {
  container: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    '&:last-child': {
      borderBottomWidth: 0,
    },
  }),
  content: css({
    position: 'relative',
    maxWidth: FLYER_CONTAINER_MAXWIDTH,
    margin: '0 auto',
    padding: '50px 15px',
    [mUp]: {
      padding: '90px 0',
    },
    '& > :last-child': {
      marginBottom: '0 !important',
    },
  }),
  contentWithShare: css({
    paddingBottom: 100,
    [mUp]: {
      paddingBottom: 140,
    },
  }),
  share: css({
    position: 'absolute',
    bottom: 50,
    [mUp]: {
      bottom: 90,
    },
  }),
  contentOpening: css({
    marginBottom: -72,
    [mUp]: {
      marginBottom: -144,
    },
  }),
}

export const FlyerTile: React.FC<{
  children?: ReactNode
  attributes?: any
  innerStyle?: object
  id?: string
  [x: string]: unknown
}> = ({ children, attributes = {}, innerStyle = {}, id, ...props }) => {
  const [colorScheme] = useColorContext()
  const { ShareTile } = useRenderContext()
  return (
    <div
      {...props}
      id={id}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
      {...colorScheme.set('background', 'flyerBg')}
    >
      <div
        {...styles.content}
        {...(!!ShareTile && styles.contentWithShare)}
        style={innerStyle}
      >
        {!!ShareTile && (
          <div {...styles.share} contentEditable={false}>
            <ShareTile tileId={id} />
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

export const FlyerTileMeta: React.FC<{
  children?: ReactNode
  attributes?: any
  innerStyle?: object
  [x: string]: unknown
}> = ({ children, attributes = {}, innerStyle = {}, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
      {...colorScheme.set('background', 'flyerBg')}
    >
      <div {...styles.content} style={innerStyle}>
        {children}
      </div>
    </div>
  )
}

export const FlyerTileOpening: React.FC<{
  children?: ReactNode
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...props}
      {...attributes}
      {...colorScheme.set('background', 'flyerBg')}
    >
      <div {...styles.content} {...styles.contentOpening}>
        {children}
      </div>
    </div>
  )
}

export const EditorFlyerTile: React.FC<{
  children?: ReactNode
  slatechildren: CustomDescendant[]
  attributes: any
  [x: string]: unknown
}> = ({ children, slatechildren = [], attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  const charCount = useMemo(() => {
    const tree = slatechildren.filter(
      (n) => isSlateElement(n) && n.type !== 'flyerMetaP',
    )
    return renderAsText(tree).length
  }, [slatechildren])
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
    >
      <Message
        text={`${charCount} Zeichen`}
        type={charCount > MAX_CHAR ? 'error' : 'info'}
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
        }}
      />
      <div {...styles.content}>{children}</div>
    </div>
  )
}
