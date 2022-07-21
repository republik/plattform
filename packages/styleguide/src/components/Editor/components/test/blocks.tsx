import {
  BlockQuoteElement,
  FigureCaptionElement,
  FigureElement,
  FlyerTileElement,
  FlyerTileOpeningElement,
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

export const flyerTileOpening: FlyerTileOpeningElement = {
  type: 'flyerTileOpening',
  children: [
    {
      type: 'headline',
      children: [{ text: '' }],
    },
    {
      type: 'flyerMetaP',
      children: [
        {
          text: '',
        },
      ],
    },
  ],
}

export const flyerTile: FlyerTileElement = {
  type: 'flyerTile',
  children: [
    {
      type: 'flyerMetaP',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerTopic',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerTitle',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerAuthor',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'flyerPunchline',
      children: [{ text: '' }],
    },
  ],
}
