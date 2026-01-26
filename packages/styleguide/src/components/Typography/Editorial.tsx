import { css } from 'glamor'
import React, { useMemo } from 'react'
import { underline } from '../../lib/styleMixins'
import { fontStyles } from '../../theme/fonts'
import { mUp } from '../../theme/mediaQueries'
import { useColorContext } from '../Colors/useColorContext'
import { editorialFontRule as fontRule, interactionFontRule } from './fontRules'
import * as styles from './styles'
import { convertStyleToRem, pxToRem } from './utils'

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

type HeadlineProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'h1'>
} & React.ComponentPropsWithoutRef<'h1'>

export const Headline = ({ children, attributes, ...props }: HeadlineProps) => {
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
  ':first-child': {
    marginTop: 0,
  },
  ':last-child': {
    marginBottom: 0,
  },
})

type SubheadProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'h2'>
} & React.ComponentPropsWithoutRef<'h2'>

export const Subhead = ({ children, attributes, ...props }: SubheadProps) => {
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

type LeadProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
} & React.ComponentPropsWithoutRef<'p'>

export const Lead = ({ children, attributes, ...props }: LeadProps) => {
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

const subjectStyle = css({
  color: '#8c8c8c',
  display: 'inline',
  margin: 0,
  '&::after': {
    content: ' ',
  },
  ...convertStyleToRem(styles.sansSerifRegular19),
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular23),
    lineHeight: '27px',
  },
})

type SubjectProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'h2'>
} & React.ComponentPropsWithoutRef<'h2'>

export const Subject = ({ children, attributes, ...props }: SubjectProps) => {
  return (
    <h2 {...attributes} {...props} {...subjectStyle}>
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

type CreditProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
} & React.ComponentPropsWithoutRef<'p'>

export const Credit = ({ children, attributes, ...props }: CreditProps) => {
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

type FormatProps = {
  children: React.ReactNode
  color?: string
  attributes?: React.ComponentPropsWithoutRef<'p'>
} & React.ComponentPropsWithoutRef<'p'>

export const Format = ({
  children,
  color,
  attributes,
  ...props
}: FormatProps) => {
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
  '&.no-margin-top': {
    marginTop: -22,
    [mUp]: {
      marginTop: `-${pxToRem(30)}`,
    },
  },
  ':last-child': {
    marginBottom: 0,
  },
  'h2 + &': {
    marginTop: 0,
  },
})

type ParagraphProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
  noMarginTop?: boolean
  isEmpty?: boolean
} & React.ComponentPropsWithoutRef<'p'>

export const P = ({
  children,
  attributes,
  noMarginTop,
  isEmpty,
  ...props
}: ParagraphProps) => {
  const [colorScheme] = useColorContext()

  if (isEmpty) return null

  const className = [attributes?.className, noMarginTop && 'no-margin-top']
    .filter(Boolean)
    .join(' ')
  return (
    <p
      {...attributes}
      className={className}
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

type QuestionProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
} & React.ComponentPropsWithoutRef<'p'>

export const Question = ({ children, attributes, ...props }: QuestionProps) => {
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

type EmphasisProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'strong'>
} & React.ComponentPropsWithoutRef<'strong'>

export const Emphasis = ({ children, attributes, ...props }: EmphasisProps) => (
  <strong {...attributes} {...props} {...emphasis}>
    {children}
  </strong>
)

const cursive = css(fontStyles.serifItalic)

type CursiveProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'em'>
} & React.ComponentPropsWithoutRef<'em'>

export const Cursive = ({ children, attributes, ...props }: CursiveProps) => (
  <em {...attributes} {...props} {...cursive}>
    {children}
  </em>
)

const strikeThrough = css({
  textDecoration: 'line-through',
})

type StrikeThroughProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'span'>
} & React.ComponentPropsWithoutRef<'span'>

export const StrikeThrough = ({
  children,
  attributes,
  ...props
}: StrikeThroughProps) => (
  <span {...attributes} {...props} {...strikeThrough}>
    {children}
  </span>
)

export const link = css({
  ...underline,
  cursor: 'pointer',
})

type LinkProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'a'>
} & React.ComponentPropsWithoutRef<'a'>

export const A = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ children, attributes, ...props }, ref) => {
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
  },
)

const note = css({
  ...convertStyleToRem(styles.sansSerifRegular12),
  margin: '22px 0',
  [mUp]: {
    ...convertStyleToRem(styles.sansSerifRegular15),
    margin: '30px 0',
  },
})

type NoteProps = {
  children: React.ReactNode
  attributes?: React.ComponentPropsWithoutRef<'p'>
} & React.ComponentPropsWithoutRef<'p'>

export const Note = ({ children, attributes, ...props }: NoteProps) => {
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
