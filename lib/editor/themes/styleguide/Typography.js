import React from 'react'
import { colors, P, H1, H2, Lead } from '@project-r/styleguide'
import { css } from 'glamor'
import { Placeholder } from 'slate'
import BoldIcon from 'react-icons/lib/fa/bold'
import ItalicIcon from 'react-icons/lib/fa/italic'
import UnderlineIcon from 'react-icons/lib/fa/underline'
import StrikethroughIcon from 'react-icons/lib/fa/strikethrough'

const styles = {
  markButton: {
    textAlign: 'center',
    display: 'inline-block',
    width: '30px',
    cursor: 'pointer',
    transition: 'background-color 0.1s, opacity 0.1s',
    '&[data-active="true"]': {
      backgroundColor: colors.divider
    },
    '&[data-disabled="true"]': {
      opacity: 0.3,
      backgroundColor: 'transparent'
    }
  },
  blockButton: {
    display: 'block',
    cursor: 'pointer',
    transition: 'background-color 0.1s, opacity 0.1s',
    '&[data-active="true"]': {
      backgroundColor: colors.divider
    },
    '&[data-disabled="true"]': {
      opacity: 0.3,
      backgroundColor: 'transparent'
    }
  },
  stringButton: {
    textAlign: 'center',
    display: 'inline-block',
    width: '30px',
    transition: 'background-color 0.1s, opacity 0.1s',
    cursor: 'pointer',
    '&[data-disabled="true"]': {
      opacity: 0.3,
      backgroundColor: 'transparent'
    }
  }
}

export default {
  Typography: {
    Blocks: {
      P: ({ children }) =>
        <P>
          {children}
        </P>,
      H1: ({ children, node, state }) =>
        <H1>
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
            Title...
          </Placeholder>
          {children}
        </H1>,
      H2: ({ children }) =>
        <H2>
          {children}m
        </H2>,
      Lead: ({ children }) =>
        <Lead>
          {children}
        </Lead>
    },
    UI: {
      MarkButton: {
        Bold: props => (
          <span {...{...css(styles.markButton), ...props}}>
            <BoldIcon />
          </span>
        ),
        Italic: props => (
          <span {...{...css(styles.markButton), ...props}}>
            <ItalicIcon />
          </span>
        ),
        Underline: props => (
          <span {...{...css(styles.markButton), ...props}}>
            <UnderlineIcon />
          </span>
        ),
        Strikethrough: props => (
          <span {...{...css(styles.markButton), ...props}}>
            <StrikethroughIcon />
          </span>
        )
      },
      BlockButton: {
        H2: props => (
          <span {...{...css(styles.blockButton), ...props}}>
            Subtitle
          </span>
        ),
        P: props => (
          <span {...{...css(styles.blockButton), ...props}}>
            Paragraph
          </span>
        ),
        Lead: props => (
          <span {...{...css(styles.blockButton), ...props}}>
            Lead
          </span>
        )
      },
      StringButton: ({ children, ...props }) => (
        <span {...{...css(styles.stringButton), ...props}}>
          {children}
        </span>
      )
    }
  }
}
