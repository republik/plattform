import React, { useMemo } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { Message } from '../Editor/Render/Message'
import renderAsText from '../Editor/Render/text'
import { CustomDescendant } from '../Editor/custom-types'
import { isSlateElement } from '../Editor/Render/helpers'

const MAX_CHAR = 600
export const FLYER_CONTAINER_MAXWIDTH = 700

const styles = {
  container: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
  }),
  content: css({
    maxWidth: FLYER_CONTAINER_MAXWIDTH,
    margin: '0 auto',
    padding: '50px 15px',
    [mUp]: {
      padding: '90px 0',
    },
    '& > *': {},
    '& > :not(.ui-element)': {
      // paddingTop: 90,
    },
    '& > :not(.ui-element) ~ :not(.ui-element)': {
      // paddingTop: 'inherit',
    },
    '& > :last-child': {
      marginBottom: '0 !important',
    },
  }),
}

export const FlyerTile: React.FC<{
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
    >
      <div {...styles.content}>{children}</div>
    </div>
  )
}

export const EditorFlyerTile: React.FC<{
  slateChildren: CustomDescendant[]
  attributes: any
  [x: string]: unknown
}> = ({ children, slateChildren = [], attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  const charCount = useMemo(() => {
    const tree = slateChildren.filter(
      (n) => isSlateElement(n) && n.type !== 'flyerMetaP',
    )
    return renderAsText(tree).length
  }, [slateChildren])
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
    >
      <Message
        text={`${charCount} ${charCount === 1 ? 'Zeiche' : 'Zeichen'}`}
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
