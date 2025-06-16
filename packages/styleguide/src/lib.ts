'use client'
import * as allMediaQueries from './theme/mediaQueries'

export { default as zIndex } from './theme/zIndex'
export { default as colors } from './theme/colors'
export const mediaQueries = allMediaQueries

export { fontFamilies } from './theme/fonts'

export { timeFormat, timeParse } from './lib/timeFormat'
export { default as timeago } from './lib/timeago'
export { default as timeahead } from './lib/timeahead'
export { default as timeduration } from './lib/timeduration'
export { slug } from './lib/slug'
export { inQuotes } from './lib/inQuotes'
export { createFormatter, createPlaceholderFormatter } from './lib/translate'

export { default as Logo } from './components/Logo'
export {
  default as BrandMark,
  DEFAULT_PROFILE_PICTURE,
} from './components/Logo/BrandMark'
export { default as Button, plainButtonRule } from './components/Button'
export { default as Field } from './components/Form/Field'
export { default as FieldSet } from './components/Form/FieldSet'
export { default as Radio } from './components/Form/Radio'
export { default as Checkbox } from './components/Form/Checkbox'
export { default as Slider } from './components/Form/Slider'
export { default as Loader } from './components/Loader'
export { default as RawHtml } from './components/RawHtml'
export { default as IllustrationHtml } from './components/IllustrationHtml'
export { default as Dropdown } from './components/Form/Dropdown'
export { default as Autocomplete } from './components/Form/Autocomplete'
export { default as TitleBlock } from './components/TitleBlock'
export { default as Center, Breakout } from './components/Center'
export { AudioPlayer } from './components/AudioPlayer'
export { VideoPlayer } from './components/VideoPlayer'
export { default as globalMediaState } from './lib/globalMediaState'
export { default as LazyLoad } from './components/LazyLoad'
export { default as LazyImage } from './components/LazyLoad/Image'
export { Collapsable } from './components/Collapsable'
export { default as CalloutMenu } from './components/Callout/CalloutMenu'
export {
  default as ColorContext,
  ColorContextProvider,
  ColorContextLocalExtension,
  RootColorVariables,
  InvertedColorScheme,
} from './components/Colors/ColorContext'
export { useColorContext } from './components/Colors/useColorContext'
export {
  InfoBox,
  InfoBoxText,
  InfoBoxTitle,
  InfoBoxSubhead,
  InfoBoxListItem,
} from './components/InfoBox'
export {
  PullQuote,
  PullQuoteSource,
  PullQuoteText,
} from './components/PullQuote'
export { BlockQuote, BlockQuoteParagraph } from './components/BlockQuote'
export {
  Figure,
  FigureCover,
  FigureGroup,
  FigureByline,
  FigureCaption,
  FigureImage,
  MIN_GALLERY_IMG_WIDTH,
} from './components/Figure'
export { GalleryContext } from './components/Figure/GalleryContext'
export { Tweet } from './components/Social'
export { Video } from './components/Video'
export { TeaserFeed, getTeaserHref } from './components/TeaserFeed'
export {
  TeaserFrontImage,
  TeaserFrontImageHeadline,
  TeaserFrontTypo,
  TeaserFrontTypoHeadline,
  TeaserFrontSplit,
  TeaserFrontSplitHeadline,
  TeaserFrontTile,
  TeaserFrontTileHeadline,
  TeaserFrontTileRow,
  TeaserFrontLead,
  TeaserFrontCredit,
} from './components/TeaserFront'
export { FormatTag } from './components/Format'

export { TeaserSectionTitle } from './components/TeaserShared'

export { ProgressCircle } from './components/Progress'
export { Spinner, InlineSpinner } from './components/Spinner'
export { default as BabySpinner } from './components/Spinner/BabySpinner'
export {
  CommentBodyBlockQuote,
  CommentBodyBlockQuoteParagraph,
  CommentBodyCode,
  CommentBodyHeading,
  CommentBodyList,
  CommentBodyListItem,
  CommentBodyParagraph,
} from './components/CommentBody'
export { CommentTeaser } from './components/CommentTeaser'
export { Overlay, OverlayToolbar, OverlayBody } from './components/Overlay'

export { StatementNode } from './components/Discussion/Statements'

export { Container, NarrowContainer } from './components/Grid'
export {
  fontStyles,
  linkRule,
  plainLinkRule,
  A,
  H1,
  H2,
  Lead,
  P,
  Label,
  Interaction,
  Meta,
  Editorial,
  Flyer,
  Sub,
  Sup,
  HR,
} from './components/Typography'
export {
  DEFAULT_FONT_SIZE,
  pxToRem,
  convertStyleToRem,
} from './components/Typography/utils'

export {
  readDiscussionCommentDraft,
  CommentComposer,
  CommentComposerPlaceholder,
  CommentHeaderProfile,
} from './components/Discussion/Composer'

export { renderCommentMdast } from './components/Discussion/Internal/Comment/render'
export { default as RelativeTime } from './components/Discussion/Internal/Comment/RelativeTime'
export { IconLink as DiscussionIconLink } from './components/Discussion/Internal/Comment/IconLink'

export { SEPARATOR as EXPANDABLE_LINK_SEPARATOR } from './components/ExpandableLink/ExpandableLink'

export { default as DiscussionCommentsWrapper } from './components/Discussion/DiscussionCommentsWrapper'
export { CommentNode, BoardComment } from './components/Discussion/Tree'
export type { CommentProps } from './components/Discussion/Tree'

export { DiscussionContext } from './components/Discussion/DiscussionContext'

export { useMediaQuery } from './lib/useMediaQuery'
export { useCurrentMinute } from './lib/useCurrentMinute'
export { useBoundingClientRect } from './lib/useBoundingClientRect'
export { usePrevious } from './lib/usePrevious'
export { useDebounce } from './lib/useDebounce'
export { useBodyScrollLock, isBodyScrollLocked } from './lib/useBodyScrollLock'
export { HeaderHeightProvider, useHeaderHeight } from './lib/useHeaderHeight'
export { shouldIgnoreClick } from './lib/helpers'

export { default as ActiveDebateTeaser } from './components/TeaserActiveDebates/DebateTeaser'
export { default as IconButton } from './components/IconButton'

export { VariableContext } from './components/Variables'
export { default as ShareImageGenerator } from './components/ShareImage'
export {
  default as ShareImagePreview,
  socialPreviewStyles,
  socialPreviewWidth,
  SHARE_IMAGE_DEFAULTS,
  SHARE_IMAGE_HEIGHT,
  SHARE_IMAGE_WIDTH,
} from './components/ShareImage/ShareImagePreview'
export { default as SharePreviewFacebook } from './components/ShareImage/SharePreviewFacebook'
export { default as SharePreviewTwitter } from './components/ShareImage/SharePreviewTwitter'
export {
  default as AudioCoverGenerator,
  COVER_IMAGE_WIDTH,
  COVER_IMAGE_HEIGHT,
} from './components/AudioCoverGenerator'

export { default as TeaserEmbedComment } from './components/TeaserEmbedComment'
export { SeriesNav } from './components/SeriesNav'
export { default as TabButton } from './components/Tabs/TabButton'
export { default as Scroller } from './components/Tabs/Scroller'
// Export createRequire for dynamic-components
export { createRequire } from './components/DynamicComponent'

export * from './chart'

// export * from './components/Icons'

export * from './templates'
export { mdastToString } from './templates/Article/utils'

export { default as SlateRender } from './components/Editor/Render'
export { default as renderSlateAsText } from './components/Editor/Render/text'
export {
  default as flyerSchema,
  flyerStructure,
  flyerTemplate,
} from './components/Editor/schema/flyer'
export { RenderContextProvider } from './components/Editor/Render/Context'
export type {
  CustomDescendant,
  CustomElement,
} from './components/Editor/custom-types'

export { FlyerTile, FlyerTileMeta } from './components/Flyer'
export { FlyerDate } from './components/Flyer/Date'
export { default as ErrorBoundary } from './components/ErrorBoundary'

export { Author as EmailAuthor } from './templates/shared/email/components/Author'
