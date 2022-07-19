import {
  BlockQuoteElement,
  FigureCaptionElement,
  FigureElement,
  HeadlineElement,
  ParagraphElement,
  PullQuoteElement,
} from '../../custom-types'

export const figureCaption: FigureCaptionElement = {
  type: 'figureCaption',
  children: [
    { text: '' },
    {
      type: 'figureByline',
      children: [{ text: '' }],
    },
    { text: '' },
  ],
}

export const figure: FigureElement = {
  type: 'figure',
  children: [
    {
      type: 'figureImage',
      children: [{ text: '' }],
    },
    figureCaption,
  ],
}

export const blockQuote: BlockQuoteElement = {
  type: 'blockQuote',
  children: [
    {
      type: 'blockQuoteText',
      children: [{ text: '' }],
    },
    figureCaption,
  ],
}

export const pullQuote: PullQuoteElement = {
  type: 'pullQuote',
  children: [
    {
      type: 'pullQuoteText',
      children: [{ text: '' }],
    },
    {
      type: 'pullQuoteSource',
      children: [{ text: '' }],
    },
  ],
}

export const headline: HeadlineElement = {
  type: 'headline',
  children: [{ text: '' }],
}

export const paragraph: ParagraphElement = {
  type: 'paragraph',
  children: [{ text: '' }],
}
