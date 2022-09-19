import React, { useMemo } from 'react'
import { css } from 'glamor'
import { useColorContext } from '../Colors/ColorContext'
import { mUp } from '../../theme/mediaQueries'
import { Message } from '../Editor/Render/Message'
import renderAsText from '../Editor/Render/text'

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
  children: any
  attributes: any
  [x: string]: unknown
}> = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  const tree = children?.props?.nodes?.filter((n) => n.type !== 'MetaP')
  console.log({ props })
  const charCount = tree ? renderAsText(tree).length : 0
  return (
    <div
      {...props}
      {...attributes}
      {...styles.container}
      {...colorScheme.set('borderBottomColor', 'flyerText')}
    >
      {!!charCount && (
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
      )}
      <div {...styles.content}>{children}</div>
    </div>
  )
}
