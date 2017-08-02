import { Placeholder } from 'slate'
import React from 'react'

export default {
  Blocks: {
    ImageWithCaption: ({ children }) =>
      <div>
        {children}
      </div>,
    Image: ({ src }) => <img src={src} />,
    CaptionSection: ({ children }) =>
      <div>
        {children}
      </div>,
    ImageCaption: ({ node, state, children }) =>
      <small style={{ position: 'relative' }}>
        <Placeholder
          firstOnly={false}
          parent={node}
          node={node}
          state={state}
          style={{
            position: 'relative',
            whiteSpace: 'nowrap',
            opacity: '.5'
          }}
        >
          Image caption...
        </Placeholder>
        {children}
      </small>,
    ImageSource: ({ node, state, children }) =>
      <small>
        <em>
          <Placeholder
            firstOnly={false}
            parent={node}
            node={node}
            state={state}
            style={{
              position: 'relative',
              whiteSpace: 'nowrap',
              opacity: '.5'
            }}
          >
            Image source...
          </Placeholder>
          {children}
        </em>
      </small>,
    ImagePlaceholder: () =>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '100%',
            paddingBottom: '57%',
            backgroundColor: '#999'
          }}
        />
      </div>
  }
}
