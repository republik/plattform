// =========== NOTES ===========
// d = done, a corresponding icon has been found and added

export { IconContextProvider, useIconContext } from './IconContext'
export {
  MdPictureAsPdf as PdfIcon, // d -> IconPdf
  MdFileDownload as DownloadIcon, // d -> IconDownload
  MdVolumeUp as AudioIcon, // d -> IconAudio
  MdBookmark as BookmarkIcon, // d -> IconBookmark
  MdBookmarkBorder as BookmarkBorderIcon, // d -> IconBookmarkBorder
  MdSearch as SearchIcon, // d -> IconSearch
  MdPlayArrow as PlayIcon, // d -> IconPlay
  MdPause as PauseIcon, // d -> IconPause
  MdSkipPrevious as RewindIcon, // d -> IconRewind
  MdClose as CloseIcon, // d -> IconClose
  MdOpenInNew as NewPageIcon, // d -> IconNewPage
  MdMood as MoodIcon, // d -> IconMood
  MdKeyboardArrowDown as ArrowDownIcon, // r -> IconKeyboardArrowDown
  MdKeyboardArrowUp as ArrowUpIcon, // r -> IconKeyboardArrowUp
  MdKeyboardArrowLeft as ArrowLeftIcon, // r -> IconKeyboardArrowLeft
  MdKeyboardArrowRight as ArrowRightIcon, // r -> IconKeyboardArrowRight
  MdFlag as ReportIcon, // d -> IconReport
  MdEdit as EditIcon, //d -> IconEdit
  MdVisibilityOff as UnpublishIcon, // d -> IconUnpublish
  MdReply as ReplyIcon, // d -> IconReply
  MdStarBorder as FeaturedIcon, // d -> IconFeatured
  MdMoreVert as MoreIcon, // r -> IconMoreVertical
  MdCheck as CheckIcon, // d -> IconCheck
  MdFilter as GalleryIcon, // d -> IconGallery
  MdChevronLeft as ChevronLeftIcon, // d -> IconChevronLeft
  MdChevronRight as ChevronRightIcon, // d -> IconChevronRight
  MdFullscreen as FullscreenIcon, // d -> IconFullscreen
  MdFullscreenExit as FullscreenExitIcon, // d -> IconFullscreenExit
  MdPodcasts as PodcastIcon, // d -> IconPodcast
  MdPlayCircleOutline as PlayCircleIcon, // d -> IconPlayCircle
  MdPauseCircleOutline as PauseCircleIcon, // d
  MdQueryBuilder as ReadingTimeIcon, // r -> IconSchedule
  MdMail as MailIcon, // d -> IconMail
  MdMailOutline as MailOutlineIcon, // d -> IconMailOutline
  MdPhonelink as PhonelinkIcon, // r -> IconDevices
  MdLink as LinkIcon, // d -> IconLink
  MdHighlightOff as HighlightOffIcon, // r -> IconCancel
  MdLaunch as LaunchIcon, // r -> IconOpenInNew
  MdRssFeed as RssFeedIcon, // d -> IconRssFeed
  MdArrowDownward as ArrowDownwardIcon, // d -> IconArrowDownward
  MdArrowForward as ArrowForwardIcon, // d -> IconArrowForward
  MdArrowBack as ArrowBackIcon, // d -> IconArrowBack
  MdExpandMore as ExpandMoreIcon, //d -> IconExpandMore
  MdExpandLess as ExpandLessIcon, //d -> IconExpandLess
  MdDone as DoneIcon, // d -> IconDone
  MdNotificationsActive as NotificationsActiveIcon, // d -> IconNotificationsActive
  MdNotificationsActive as FollowIcon, // r -> IconNotificationsActive
  MdNotifications as NotificationIcon, // d -> IconNotifications
  MdNotificationsOff as NotificationsOffIcon, //d -> IconNotificationsOff
  MdNotificationsNone as NotificationsNoneIcon, // r -> IconNotificationsOutline
  MdRotateLeft as RotateLeftIcon, //d -> IconRotateLeft
  MdRotateLeft as RevertIcon, // r -> IconRotateLeft
  MdList as ListIcon, // d -> IconList
  MdFormatListBulleted as UlIcon, // r -> IconUnorderedList
  MdFormatListNumbered as OlIcon, // r -> IconOrderedList
  MdFilterList as FilterListIcon, // d -> IconFilterList
  MdAdd as AddIcon, // d -> IconAdd
  MdRemove as RemoveIcon, // d  -> IconRemove
  MdRemoveCircleOutline as RemoveCircleIcon, // r -> IconRemoveCircle
  MdAccountBox as AccountBoxIcon, // d -> IconAccountBox
  MdNoteAdd as NoteAddIcon, // d -> IconNoteAdd
  MdVpnKey as VpnKeyIcon, // d -> IconVpnKey
  MdLanguage as LanguageIcon, // d -> IconLanguage
  MdFavorite as FavoriteIcon, // d -> IconFavorite
  MdStars as StarsIcon, // d -> IconStars
  MdTrendingFlat as TrendingFlatIcon, // d -> IconTrendingFlat
  MdFolder as FolderIcon, // d -> IconFolder
  MdBrightness2 as DarkmodeIcon, // d -> IconDarkMode
  MdForward30 as ForwardIcon, // d  -> IconForward
  MdReplay10 as ReplayIcon, // d -> IconReplay
  MdCheckCircle as CheckCircleIcon, // d -> IconCheckCircle
  MdLock as LockIcon, // d -> IconLock
  MdTextFormat as TextFormatIcon, // r -> IconFormatColorText
  MdOutlineSmsFailed as EtiquetteIcon, // d -> IconEtiquette
  MdUnfoldLess as UnfoldLessIcon, // d -> IconUnfoldLess
  MdUnfoldMore as UnfoldMoreIcon, // d -> IconUnfoldMore
  MdFormatBold as BoldIcon, // d -> IconFormatBold
  MdFormatItalic as ItalicIcon, // d -> IconFormatItalic
  MdKeyboardReturn as BreakIcon, // d -> IconBreak
  MdOutlineImage as ImageIcon, //  -> IconImage
  MdFormatQuote as QuoteIcon, // d -> IconFormatQuote
  MdStrikethroughS as StrikeThrough, // d -> IconFormatStrikethrough
  MdTitle as TitleIcon, // d -> IconTitle
  MdCode as CodeIcon, // d -> IconCode
  MdDragHandle as PunchlineIcon, // r -> IconDragHandle
  MdOutlineCallToAction as ArticlePreviewIcon, // r -> IconCallToActionOutline
  MdViewQuilt as FlyerTileIcon, // d -> IconFlyerTile
  MdViewHeadline as FlyerTileMetaIcon, // d -> IconFlyerTileMeta
  MdOutlineQuiz as QuizIcon, // d -> IconQuiz
  MdOutlineDelete as DeleteIcon, // r -> IconDeleteOutline
  MdRateReview as MemoIcon, // d -> IconMemo
  MdMic as MicIcon, // d -> IconMic
  MdPlaylistAdd as PlaylistAddIcon, // d -> IconPlaylistAdd
  MdPlaylistAddCheck as PlaylistRemoveIcon, // r -> IconPlaylistAddCheck
  MdDragHandle as DragHandleIcon, // d -> IconDragHandle
  MdSkipNext as SkipNextIcon, // d -> IconSkipNext
  MdSubject as ArticleIcon, // d -> IconArticle
  MdContentCopy as CopyToClippboardIcon, // r -> IconContentCopyOutline
  MdRadioButtonChecked as RadioCheckedIcon, // d -> IconRadioChecked
  MdRadioButtonUnchecked as RadioUncheckedIcon, // d -> IconRadioUnchecked
} from 'react-icons/md'

export {
  FaTelegramPlane as TelegramIcon, // d -> IconTelegram
  FaSubscript as SubIcon, // d -> IconFormatSubscript
  FaSuperscript as SupIcon, // d -> IconFormatSuperscript
} from 'react-icons/fa'

export {
  AiFillInstagram as InstagramIcon, // r -> IconInstagram (FontAwesome)
  AiOutlineCode as BlockCodeIcon, // r -> IconTerminal (MaterialDesign)
} from 'react-icons/ai'
export { SiThreema as ThreemaIcon } from 'react-icons/si' // d -> IconThreema
export { DiOpensource as OpenSourceIcon } from 'react-icons/di' // d -> IconOpenSource
export { BiParagraph as ParagraphIcon } from 'react-icons/bi' // d -> IconParagraph

// Separately export io icons to prevent a re-export conflict
// caused by react-icons export both io4 and io5 on the /all path.
// This causes duplicate exports which causes a rollup error.
export {
  IoLogoTwitter as TwitterIcon, // d -> IconTwitter
  IoLogoYoutube as YoutubeIcon, // d -> IconYoutube
  IoLogoVimeo as VimeoIcon, // d -> IconVimeo
  IoLogoWhatsapp as WhatsappIcon, // d -> IconWhatsapp
  IoLogoGoogle as GoogleIcon, // d -> IconGoogle
  IoLogoApple as AppleIcon, // d -> IconApple
  IoLogoFacebook as FacebookIcon, // d -> IconFacebook
} from 'react-icons/io5'

export { BsBlockquoteLeft as BlockQuoteIcon } from 'react-icons/bs' // d -> IconFormatBlockQuote

export { ShareIcon } from './CustomIcons/ShareIcon' // d -> IconShare
export { MarkdownIcon } from './CustomIcons/MarkdownIcon' // d -> IconMarkdown
export { BackIcon } from './CustomIcons/BackIcon' // d -> IconBack
export { DiscussionIcon } from './CustomIcons/DiscussionIcon' // d -> IconDiscussion
export { FontSizeIcon } from './CustomIcons/FontSizeIcon' // d -> IconFontSize
export { CheckSmallIcon } from './CustomIcons/MdCheckSmall' // d -> IconCheckSmall
export { ReadIcon } from './CustomIcons/MdCheckCircleOutlined' // d -> IconRead
export { ChartIcon } from './CustomIcons/MdInsertChartOutlined' // d -> IconChart
export { SearchMenuIcon } from './CustomIcons/SearchMenuIcon' // d -> IconSearchMenu
export { SpotifyIcon } from './CustomIcons/SpotifyIcon' // d -> IconSpotify
export { BoldSearchIcon } from './CustomIcons/BoldSearchIcon' // d -> IconSearchMenuBold

// Publikator
// export { SuperscriptIcon } from './CustomIcons/SuperscriptIcon'
// export { SubscriptIcon } from './CustomIcons/SubscriptIcon'
// export { MdFormatBold as BoldIcon } from '@react-icons/all'
// export { MdStrikethroughS as StrikethroughIcon } from '@react-icons/all'
// export { MdFormatItalic as ItalicIcon } from '@react-icons/all'
// export { MdInfoOutline as InfoOutlineIcon } from '@react-icons/all'
// export { MdSubdirectoryArrowLeft as MoveToEndIcon } from '@react-icons/all'
// export { MdSubdirectoryArrowRight as MoveIntoIcon } from '@react-icons/all'
// export { FaTag as InsertVarIcon } from '@react-icons/all'
// export { MdPublic as PublicIcon } from '@react-icons/all'
// export { MdPhoneIphone as DevicePhoneIcon } from '@react-icons/all'
// export { MdTabletMac as DeviceTabletIcon } from '@react-icons/all'
// export { MdLaptopMac as DeviceLaptopIcon } from '@react-icons/all'
// export { MdDesktopMac as DeviceDesktopIcon } from '@react-icons/all'
// export { MdArrowDropDown as DropDownIcon } from '@react-icons/all'
// export { MdArrowDropUp as DropUpIcon } from '@react-icons/all'
// export { MdWrapText as TextDiffIcon } from '@react-icons/all'
// export { MdMoreHoriz as MoreHorizIcon } from '@react-icons/all'
// export { MdLockOpen as LockOpenIcon } from '@react-icons/all'
// export { MdGrade as StarFilledIcon } from '@react-icons/all'
// export { MdCallSplit as NewerVersionIcon } from '@react-icons/all'
// export { MdSignalWifiOff as OfflineIcon } from '@react-icons/all'
// export { MdLens as CircleFilledIcon } from '@react-icons/all'
// export { FaCogs as SettingsIcon } from '@react-icons/all'
