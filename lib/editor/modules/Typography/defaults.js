import React from 'react'
import { css } from 'glamor'

const styles = {
  button: {
    'padding': '3px',
    'color': '#666',
    '&[data-active="true"]': {
      'color': '#000'
    }
  }
}

export default {
  Typography: {
    Constants: {
      P: 'P',
      H1: 'H1',
      H2: 'H2',
      H3: 'H3',
      LEAD: 'Lead',
      BOLD: 'Bold',
      ITALIC: 'Italic',
      UNDERLINE: 'Underline',
      STRIKETHROUGH: 'Strikethrough'
    },
    Blocks: {
      P: ({ children }) =>
        <p>
          {children}
        </p>,
      H1: ({ children }) =>
        <h1>
          {children}
        </h1>,
      H2: ({ children }) =>
        <h2>
          {children}
        </h2>,
      H3: ({ children }) =>
        <h3>
          {children}
        </h3>,
      Lead: ({ children }) =>
        <p className='lead'>
          {children}
        </p>
    },
    Marks: {
      Bold: ({ children }) =>
        <strong>
          {children}
        </strong>,
      Italic: ({ children }) => {
        return <em>
          {children}
        </em>
      },
      Strikethrough: ({ children }) =>
        <del>
          {children}
        </del>,
      Underline: ({ children }) =>
        <u>
          {children}
        </u>
    },
    UI: {
      MarkButton: {
        Bold: props => (
          <span {...{...css(styles.button), ...props}}>
            <strong>B</strong>
          </span>
        ),
        Italic: props => (
          <span {...{...css(styles.button), ...props}}>
            <em>I</em>
          </span>
        ),
        Underline: props => (
          <span {...{...css(styles.button), ...props}}>
            <u>U</u>
          </span>
        ),
        Strikethrough: props => (
          <span {...{...css(styles.button), ...props}}>
            <del>S</del>
          </span>
        )
      },
      BlockButton: {
        H2: props => (
          <span {...{...css(styles.button), ...props}}>
            H2
          </span>
        ),
        P: props => (
          <span {...{...css(styles.button), ...props}}>
            P
          </span>
        ),
        Lead: props => (
          <span {...{...css(styles.button), ...props}}>
            Lead
          </span>
        )
      },
      StringButton: ({ children, ...props }) => (
        <span {...{...css(styles.button), ...props}}>
          {children}
        </span>
      )
    }
  }
}
