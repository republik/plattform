import { ComponentProps } from 'react'
import { ChildrenProps } from '../../types/base'

export interface BlockCodeProps extends ChildrenProps {}

export interface BlockQuoteParagraphProps extends ChildrenProps {}
export interface BlockQuoteNestedProps extends ChildrenProps {}
export interface BlockQuoteProps extends ChildrenProps {}

export interface CommentBodyContainerProps extends ChildrenProps {}

export interface ListProps extends ChildrenProps {
  data: {
    ordered: true
    start?: number
  }
}
export interface ListItemProps extends ChildrenProps {}

export interface ParagraphProps extends ChildrenProps {}
export interface FeaturedTextProps extends ChildrenProps {}
export interface HeadingProps extends ChildrenProps {}
export interface DefinitionProps extends ChildrenProps {}
export interface CodeProps extends ChildrenProps {}
export interface LinkProps extends ChildrenProps {
  href: ComponentProps<'a'>['href']
  title?: ComponentProps<'a'>['title']
}
export interface StrikeThroughProps extends ChildrenProps {}
