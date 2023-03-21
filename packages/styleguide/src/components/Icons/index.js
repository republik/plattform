// =========== NOTES ===========
// d = done, a corresponding icon has been found and added

export { IconContextProvider, useIconContext } from './IconContext'
export {
  MdPictureAsPdf as PdfIcon, // d
  MdFileDownload as DownloadIcon, // d
  MdVolumeUp as AudioIcon, // d
  MdBookmark as BookmarkIcon, // d
  MdBookmarkBorder as BookmarkBorderIcon, // d
  MdSearch as SearchIcon, // d
  MdPlayArrow as PlayIcon, // d
  MdPause as PauseIcon, // d
  MdSkipPrevious as RewindIcon,
  MdClose as CloseIcon, // d
  MdOpenInNew as NewPageIcon,
  MdMood as MoodIcon, // d
  MdKeyboardArrowDown as ArrowDownIcon, // d
  MdKeyboardArrowUp as ArrowUpIcon, //d
  MdKeyboardArrowLeft as ArrowLeftIcon, //d
  MdKeyboardArrowRight as ArrowRightIcon, //d
  MdFlag as ReportIcon, // d
  MdEdit as EditIcon, //d
  MdVisibilityOff as UnpublishIcon, //d
  MdReply as ReplyIcon, // d
  MdStarBorder as FeaturedIcon, // d
  MdMoreVert as MoreIcon,
  MdCheck as CheckIcon, // d
  MdFilter as GalleryIcon, // d
  MdChevronLeft as ChevronLeftIcon, // d
  MdChevronRight as ChevronRightIcon, // d
  MdFullscreen as FullscreenIcon, // d
  MdFullscreenExit as FullscreenExitIcon, // d
  MdPodcasts as PodcastIcon, // d
  MdPlayCircleOutline as PlayCircleIcon, // d
  MdPauseCircleOutline as PauseCircleIcon, // d
  MdQueryBuilder as ReadingTimeIcon, // r -> IconSchedule
  MdMail as MailIcon, // d
  MdMailOutline as MailOutlineIcon, // d
  MdPhonelink as PhonelinkIcon, // r -> IconDevices
  MdLink as LinkIcon, // d
  MdHighlightOff as HighlightOffIcon, // r -> IconCancel
  MdLaunch as LaunchIcon, // r -> IconOpenInNew
  MdRssFeed as RssFeedIcon, // d
  MdArrowDownward as ArrowDownwardIcon, // d
  MdArrowForward as ArrowForwardIcon, // d
  MdArrowBack as ArrowBackIcon, // d
  MdExpandMore as ExpandMoreIcon, //d
  MdExpandLess as ExpandLessIcon, //d
  MdDone as DoneIcon, // d
  MdNotificationsActive as NotificationsActiveIcon, // d
  MdNotificationsActive as FollowIcon, // r -> IconNotificationsActive
  MdNotifications as NotificationIcon, // d
  MdNotificationsOff as NotificationsOffIcon, //d
  MdNotificationsNone as NotificationsNoneIcon, // r -> IconNotificationsOutline
  MdRotateLeft as RotateLeftIcon, //d
  MdRotateLeft as RevertIcon, // r -> IconRotateLeft
  MdList as ListIcon, // d
  MdFormatListBulleted as UlIcon, // d
  MdFormatListNumbered as OlIcon, // d
  MdFilterList as FilterListIcon,
  MdAdd as AddIcon, // d
  MdRemove as RemoveIcon, // d
  MdRemoveCircleOutline as RemoveCircleIcon, // r -> IconDoNotDisturbOutline
  MdAccountBox as AccountBoxIcon,
  MdNoteAdd as NoteAddIcon, // d
  MdVpnKey as VpnKeyIcon, // dV
  MdLanguage as LanguageIcon, // d
  MdFavorite as FavoriteIcon, // d
  MdStars as StarsIcon, // d
  MdTrendingFlat as TrendingFlatIcon, // d
  MdFolder as FolderIcon, // d
  MdBrightness2 as DarkmodeIcon, // r -> IconDarkMode
  MdForward30 as ForwardIcon, // d
  MdReplay10 as ReplayIcon, // d
  MdCheckCircle as CheckCircleIcon,
  MdLock as LockIcon, // d
  MdTextFormat as TextFormatIcon, // r -> IconFormatColorText
  MdOutlineSmsFailed as EtiquetteIcon, // d
  MdUnfoldLess as UnfoldLessIcon, // d
  MdUnfoldMore as UnfoldMoreIcon, // d
  MdFormatBold as BoldIcon, // d
  MdFormatItalic as ItalicIcon, // d
  MdKeyboardReturn as BreakIcon, // d
  MdOutlineImage as ImageIcon, //  -> IconImageOutline
  MdFormatQuote as QuoteIcon, // d
  MdStrikethroughS as StrikeThrough, // d
  MdTitle as TitleIcon, // d
  MdCode as CodeIcon, // d
  MdDragHandle as PunchlineIcon, // r -> IconDragHandle
  MdOutlineCallToAction as ArticlePreviewIcon, // r -> IconCallToActionOutline
  MdViewQuilt as FlyerTileIcon, // d
  MdViewHeadline as FlyerTileMetaIcon, // d
  MdOutlineQuiz as QuizIcon, // d
  MdOutlineDelete as DeleteIcon, // r -> IconDeleteOutline
  MdRateReview as MemoIcon, // d
  MdMic as MicIcon, // d
  MdPlaylistAdd as PlaylistAddIcon, // d
  MdPlaylistAddCheck as PlaylistRemoveIcon, // r -> IconPlaylistAddCheck
  MdDragHandle as DragHandleIcon, // d
  MdSkipNext as SkipNextIcon, // d
  MdSubject as ArticleIcon, // d
  MdContentCopy as CopyToClippboardIcon, // r -> IconContentCopyOutline
  MdRadioButtonChecked as RadioCheckedIcon, // d
  MdRadioButtonUnchecked as RadioUncheckedIcon, //
} from 'react-icons/md'

export {
  FaTelegramPlane as TelegramIcon, // d
  FaSubscript as SubIcon, // d
  FaSuperscript as SupIcon, // d
} from 'react-icons/fa'

export {
  AiFillInstagram as InstagramIcon, // r -> IconInstagram (FontAwesome)
  AiOutlineCode as BlockCodeIcon, // r -> IconTerminal (MaterialDesign)
} from 'react-icons/ai'
export { SiThreema as ThreemaIcon } from 'react-icons/si' // d
export { DiOpensource as OpenSourceIcon } from 'react-icons/di' // d
export { BiParagraph as ParagraphIcon } from 'react-icons/bi' // d

// Separately export io icons to prevent a re-export conflict
// caused by react-icons export both io4 and io5 on the /all path.
// This causes duplicate exports which causes a rollup error.
export {
  IoLogoTwitter as TwitterIcon, // d
  IoLogoYoutube as YoutubeIcon, // d
  IoLogoVimeo as VimeoIcon, // d
  IoLogoWhatsapp as WhatsappIcon, // d
  IoLogoGoogle as GoogleIcon, // d
  IoLogoApple as AppleIcon, // d
  IoLogoFacebook as FacebookIcon, // d
} from 'react-icons/io5'

export { BsBlockquoteLeft as BlockQuoteIcon } from 'react-icons/bs' // d

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
export { BoldSearchIcon } from './CustomIcons/BoldSearchIcon'

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
