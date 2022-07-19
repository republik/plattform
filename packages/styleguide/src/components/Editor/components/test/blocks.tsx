import {
  BlockQuoteElement,
  FigureCaptionElement,
  FigureElement,
  HeadlineElement,
  ParagraphElement,
} from '../../custom-types'

export const figureCaption: FigureCaptionElement = {
  type: 'figureCaption',
  children: [
    { text: 'A butterfly' },
    {
      type: 'figureByline',
      children: [{ text: 'lands on a branch' }],
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
      children: [{ text: 'Lorem ipsum quote' }],
    },
    figureCaption,
  ],
}

export const headline: HeadlineElement = {
  type: 'headline',
  children: [{ text: 'Hello World' }],
}

export const paragraph: ParagraphElement = {
  type: 'paragraph',
  children: [{ text: 'Lorem si amet paragraphum et sol.' }],
}
