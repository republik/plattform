import { EditorAttr, ElementsConfig } from '../../custom-types'
import { config as link } from './link'
import { config as paragraph } from './paragraph'
import { config as headline } from './headline'
import { config as breakConfig } from './break'
import { config as figure } from './figure/container'
import { config as figureImage } from './figure/image'
import { config as figureCaption } from './figure/caption'
import { config as figureByline } from './figure/byline'
import { config as pullQuote } from './pullQuote/container'
import { config as pullQuoteText } from './pullQuote/text'
import { config as pullQuoteSource } from './pullQuote/source'
import { config as blockQuote } from './blockQuote/container'
import { config as blockQuoteText } from './blockQuote/text'
import { ulConfig as ul, olConfig as ol } from './list/container'
import { config as listItem } from './list/item'
import { config as inlineCode } from './inlineCode'
import { config as blockCode } from './blockCode'
import { config as flyerTile } from './flyer'
import { config as flyerTileMeta } from './flyer/meta'
import { config as flyerTileOpening } from './flyer/opening'
import { config as flyerTileClosing } from './flyer/closing'
import { config as flyerAuthor } from './flyer/elements/author'
import { config as flyerMetaP } from './flyer/elements/metaP'
import { config as flyerPunchline } from './flyer/elements/punchline'
import { config as flyerSignature } from './flyer/elements/signature'
import { config as flyerTitle } from './flyer/elements/title'
import { config as flyerTopic } from './flyer/elements/topic'
import { config as articlePreview } from './articlePreview'

export const config: ElementsConfig = {
  paragraph,
  headline,
  inlineCode,
  link,
  figure,
  figureImage,
  figureCaption,
  figureByline,
  pullQuote,
  pullQuoteText,
  pullQuoteSource,
  blockQuote,
  blockQuoteText,
  break: breakConfig,
  ul,
  ol,
  listItem,
  blockCode,
  flyerTile,
  flyerTileClosing,
  flyerTileOpening,
  flyerTileMeta,
  flyerAuthor,
  flyerMetaP,
  flyerPunchline,
  flyerSignature,
  flyerTitle,
  flyerTopic,
  articlePreview,
}

// typesafe helper
export const configKeys: (keyof ElementsConfig)[] = Object.keys(
  config,
) as (keyof ElementsConfig)[]

export const coreEditorAttrs: EditorAttr[] = ['isVoid', 'isInline']

// TODO: make top level structure optional
//  default top level structure -> { type: [BLOCK_BUTTONS], repeat: true }
