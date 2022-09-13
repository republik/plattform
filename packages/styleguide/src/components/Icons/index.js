export { IconContextProvider, useIconContext } from './IconContext'
export {
  MdPictureAsPdf as PdfIcon,
  MdFileDownload as DownloadIcon,
  MdVolumeUp as AudioIcon,
  MdBookmark as BookmarkIcon,
  MdBookmarkBorder as BookmarkBorderIcon,
  MdSearch as SearchIcon,
  MdPlayArrow as PlayIcon,
  MdPause as PauseIcon,
  MdSkipPrevious as RewindIcon,
  MdClose as CloseIcon,
  MdOpenInNew as NewPageIcon,
  MdMood as MoodIcon,
  MdKeyboardArrowDown as ArrowDownIcon,
  MdKeyboardArrowUp as ArrowUpIcon,
  MdKeyboardArrowLeft as ArrowLeftIcon,
  MdKeyboardArrowRight as ArrowRightIcon,
  MdFlag as ReportIcon,
  MdEdit as EditIcon,
  MdVisibilityOff as UnpublishIcon,
  MdReply as ReplyIcon,
  MdStarBorder as FeaturedIcon,
  MdMoreVert as MoreIcon,
  MdCheck as CheckIcon,
  MdFilter as GalleryIcon,
  MdChevronLeft as ChevronLeftIcon,
  MdChevronRight as ChevronRightIcon,
  MdFullscreen as FullscreenIcon,
  MdFullscreenExit as FullscreenExitIcon,
  MdMic as PodcastIcon,
  MdPlayCircleOutline as PlayCircleIcon,
  MdQueryBuilder as ReadingTimeIcon,
  MdMail as MailIcon,
  MdMailOutline as MailOutlineIcon,
  MdPhonelink as PhonelinkIcon,
  MdLink as LinkIcon,
  MdHighlightOff as HighlightOffIcon,
  MdLaunch as LaunchIcon,
  MdRssFeed as RssFeedIcon,
  MdArrowDownward as ArrowDownwardIcon,
  MdArrowForward as ArrowForwardIcon,
  MdArrowBack as ArrowBackIcon,
  MdExpandMore as ExpandMoreIcon,
  MdExpandLess as ExpandLessIcon,
  MdDone as DoneIcon,
  MdNotificationsActive as NotificationsActiveIcon,
  MdNotificationsActive as FollowIcon,
  MdNotifications as NotificationIcon,
  MdNotificationsOff as NotificationsOffIcon,
  MdNotificationsNone as NotificationsNoneIcon,
  MdRotateLeft as RotateLeftIcon,
  MdRotateLeft as RevertIcon,
  MdList as ListIcon,
  MdFormatListBulleted as UlIcon,
  MdFormatListNumbered as OlIcon,
  MdFilterList as FilterListIcon,
  MdAdd as AddIcon,
  MdRemove as RemoveIcon,
  MdAccountBox as AccountBoxIcon,
  MdNoteAdd as NoteAddIcon,
  MdVpnKey as VpnKeyIcon,
  MdLanguage as LanguageIcon,
  MdFavorite as FavoriteIcon,
  MdStars as StarsIcon,
  MdTrendingFlat as TrendingFlatIcon,
  MdFolder as FolderIcon,
  MdBrightness2 as DarkmodeIcon,
  MdForward30 as ForwardIcon,
  MdReplay10 as ReplayIcon,
  MdCheckCircle as CheckCircleIcon,
  MdLock as LockIcon,
  MdTextFormat as TextFormatIcon,
  MdOutlineSmsFailed as EtiquetteIcon,
  MdUnfoldLess as UnfoldLessIcon,
  MdUnfoldMore as UnfoldMoreIcon,
  MdFormatBold as BoldIcon,
  MdFormatItalic as ItalicIcon,
  MdKeyboardReturn as BreakIcon,
  MdWallpaper as ImageIcon,
  MdFormatQuote as QuoteIcon,
  MdStrikethroughS as StrikeThrough,
  MdTitle as TitleIcon,
  MdCode as CodeIcon,
  MdDragHandle as PunchlineIcon,
  MdOutlineCallToAction as ArticlePreviewIcon,
  MdViewQuilt as FlyerTileIcon,
  MdViewHeadline as FlyerTileMetaIcon,
  MdOutlineQuiz as QuizIcon,
  MdOutlineDelete as DeleteIcon,
} from 'react-icons/md'

export {
  FaTelegramPlane as TelegramIcon,
  FaSubscript as SubIcon,
  FaSuperscript as SupIcon,
} from 'react-icons/fa'

export {
  AiFillInstagram as InstagramIcon,
  AiOutlineCode as BlockCodeIcon,
} from 'react-icons/ai'
export { SiThreema as ThreemaIcon } from 'react-icons/si'
export { DiOpensource as OpenSourceIcon } from 'react-icons/di'
export { BiParagraph as ParagraphIcon } from 'react-icons/bi'

// Separately export io icons to prevent a re-export conflict
// caused by react-icons export both io4 and io5 on the /all path.
// This causes duplicate exports which causes a rollup error.
export {
  IoLogoTwitter as TwitterIcon,
  IoLogoYoutube as YoutubeIcon,
  IoLogoVimeo as VimeoIcon,
  IoLogoWhatsapp as WhatsappIcon,
  IoLogoGoogle as GoogleIcon,
  IoLogoApple as AppleIcon,
  IoLogoFacebook as FacebookIcon,
} from 'react-icons/io5'

export { BsBlockquoteLeft as BlockQuoteIcon } from 'react-icons/bs'

export { ShareIcon } from './CustomIcons/ShareIcon'
export { MarkdownIcon } from './CustomIcons/MarkdownIcon'
export { BackIcon } from './CustomIcons/BackIcon'
export { DiscussionIcon } from './CustomIcons/DiscussionIcon'
export { FontSizeIcon } from './CustomIcons/FontSizeIcon'
export { CheckSmallIcon } from './CustomIcons/MdCheckSmall'
export { ReadIcon } from './CustomIcons/MdCheckCircleOutlined'
export { ChartIcon } from './CustomIcons/MdInsertChartOutlined'
export { SearchMenuIcon } from './CustomIcons/SearchMenuIcon'
export { SpotifyIcon } from './CustomIcons/SpotifyIcon'

// Publikator
// export { SuperscriptIcon } from './CustomIcons/SuperscriptIcon'
// export { SubscriptIcon } from './CustomIcons/SubscriptIcon'
// export { MdFormatBold as BoldIcon } from '@react-icons/all'
// export { MdStrikethroughS as StrikethroughIcon } from '@react-icons/all'
// export { MdFormatItalic as ItalicIcon } from '@react-icons/all'
// export { MdInfoOutline as InfoOutlineIcon } from '@react-icons/all'
// export { MdContentCopy as CopyToClippboardIcon } from '@react-icons/all'
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
