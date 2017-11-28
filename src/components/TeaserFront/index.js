import * as _ImageHeadline from './ImageHeadline'
import * as _SplitHeadline from './SplitHeadline'
import * as _TypoHeadline from './TypoHeadline'
import * as _TileHeadline from './TileHeadline'

export const TeaserFrontImageHeadline = { ..._ImageHeadline }
export const TeaserFrontSplitHeadline = { ..._SplitHeadline }
export const TeaserFrontTypoHeadline = { ..._TypoHeadline }
export const TeaserFrontTileHeadline = { ..._TileHeadline }

export { default as TeaserFrontImage } from './Image'
export { default as TeaserFrontTypo } from './Typo'
export { default as TeaserFrontSplit } from './Split'
export { default as TeaserFrontTile, TeaserFrontTileRow } from './Tile'

export { default as TeaserFrontLead } from './Lead'
export { default as TeaserFrontCredit } from './Credit'
export { default as TeaserFrontAuthorLink } from './AuthorLink'
