import React from 'react'
import { colors, P, H1, H2, Lead } from '@project-r/styleguide'
import { css } from 'glamor'
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
    '&[data-active="true"]': {
      backgroundColor: colors.divider
    }
  },
  blockButton: {
    display: 'block',
    cursor: 'pointer',
    '&[data-active="true"]': {
      backgroundColor: colors.divider
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
      H1: ({ children }) =>
        <H1>
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
      }
    }
  }
}
