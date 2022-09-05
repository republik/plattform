import React, { useMemo } from 'react'
import * as styles from './styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { fontStyles } from '../../theme/fonts'
import { underline } from '../../lib/styleMixins'
import { convertStyleToRem, pxToRem } from './utils'
import { useColorContext } from '../Colors/useColorContext'
import { editorialFontRule as fontRule, interactionFontRule } from './fontRules'

export {
  List,
  UnorderedList as UL,
  OrderedList as OL,
  ListItem as LI,
} from '../List'

export { editorialFontRule as fontRule } from './fontRules'

const headline = css({
  ...convertStyleToRem(styles.serifTitle30),
  margin: '0 0 12px 0',
  [mUp]: {
    ...convertStyleToRem(styles.serifTitle58),
    margin: '0 0 12px 0',
  },
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0,
  },
})

export const Headline = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h1
      {...attributes}
      {...props}
      {...headline}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </h1>
  )
}

const subhead = css({
  ...convertStyleToRem(styles.serifBold19),
  margin: '36px 0 8px 0',
  [mUp]: {
    ...convertStyleToRem(styles.serifBold24),
    margin: '46px 0 12px 0',
  },
})

export const Subhead = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <h2
      {...attributes}
      {...props}
      {...subhead}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </h2>
  )
}

const lead = css({
  ...convertStyleToRem(styles.serifRegular19),
  display: 'inline',
  margin: '0 0 10px 0',
  [mUp]: {
    ...convertStyleToRem(styles.serifRegular23),
    margin: '0 0 20px 0',
  },
})

export const Lead = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...lead}
      {...colorScheme.set('color', 'text')}
      {...fontRule}
    >
      {children}
    </p>
  )
}

const subjectStyle = {
  color: '#8c8c8c',
  display: 'inline',
  margin: 0,
  ...convertStyleToRem(styles.sansSerifRegular19),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular23),
    lineHeight: '27px',
  },
}

const subject = css({
  ...subjectStyle,
})

const subjectWithChildren = css({
  ...subjectStyle,
  paddingRight: '.2em',
  '&::after': {
    content: ' ',
  },
})

export const Subject = ({ children, attributes, ...props }) => {
  const style = children && children.length > 0 ? subjectWithChildren : subject
  return (
    <h2 {...attributes} {...props} {...style}>
      {children}
    </h2>
  )
}

const credit = css({
  margin: '10px 0 0 0',
  ...convertStyleToRem(styles.sansSerifRegular14),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular15),
    margin: '20px 0 0 0',
  },
})

export const Credit = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()

  return (
    <p
      {...attributes}
      {...props}
      {...credit}
      {...colorScheme.set('color', 'text')}
    >
      {children}
    </p>
  )
}

const format = css({
  ...convertStyleToRem(styles.sansSerifMedium16),
  margin: '0 0 18px 0',
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifMedium20),
    margin: '0 0 28px 0',
  },
})

export const Format = ({ children, color, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...format}
      {...colorScheme.set('color', color, 'format')}
    >
      {children}
    </p>
  )
}

const paragraph = css({
  margin: '22px 0 22px 0',
  ...convertStyleToRem(styles.serifRegular17),
  [mUp]: {
    ...convertStyleToRem(styles.serifRegular19),
    margin: `${pxToRem(30)} 0 ${pxToRem(30)} 0`,
  },
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0,
  },
  'h2 + &': {
    marginTop: 0,
  },
})
export const P = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...paragraph}
      {...colorScheme.set('color', 'text')}
      {...fontRule}
    >
      {children}
    </p>
  )
}

const question = css({
  ...convertStyleToRem(styles.serifBold17),
  margin: '36px 0 -14px 0',
  [mUp]: {
    ...convertStyleToRem(styles.serifBold19),
    lineHeight: '30px',
    margin: '46px 0 -18px 0',
  },
})
export const Question = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...question}
      {...colorScheme.set('color', 'text')}
      {...fontRule}
    >
      {children}
    </p>
  )
}

export const Answer = P

const emphasis = css(fontStyles.serifBold)
export const Emphasis = ({ children, attributes, ...props }) => (
  <strong {...attributes} {...props} {...emphasis}>
    {children}
  </strong>
)

const cursive = css(fontStyles.serifItalic)
export const Cursive = ({ children, attributes, ...props }) => (
  <em {...attributes} {...props} {...cursive}>
    {children}
  </em>
)

const strikeThrough = css({
  textDecoration: 'line-through',
})
export const StrikeThrough = ({ children, attributes, ...props }) => (
  <span {...attributes} {...props} {...strikeThrough}>
    {children}
  </span>
)

export const link = css({
  ...underline,
  cursor: 'pointer',
})
export const A = React.forwardRef(({ children, attributes, ...props }, ref) => {
  const [colorScheme] = useColorContext()
  const hoverRule = useMemo(
    () =>
      css({
        '@media (hover)': {
          ':hover': {
            color: colorScheme.getCSSColor('textSoft'),
          },
        },
      }),
    [colorScheme],
  )
  return (
    <a
      {...colorScheme.set('color', 'text')}
      {...attributes}
      {...props}
      {...link}
      {...hoverRule}
      ref={ref}
    >
      {children}
    </a>
  )
})

const note = css({
  ...convertStyleToRem(styles.sansSerifRegular12),
  margin: '22px 0',
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular15),
    margin: '30px 0',
  },
})

export const Note = ({ children, attributes, ...props }) => {
  const [colorScheme] = useColorContext()
  return (
    <p
      {...attributes}
      {...props}
      {...note}
      {...colorScheme.set('color', 'text')}
      {...interactionFontRule}
    >
      {children}
    </p>
  )
}
