// =========== NOTES ===========
// d = done, a corresponding icon has been found and added

export { IconContextProvider, useIconContext } from './IconContext'
export {
  MdPictureAsPdf as PdfIcon, // d -> IconPdf w
  MdFileDownload as DownloadIcon, // d -> IconDownload w
  MdVolumeUp as AudioIcon, // d -> IconAudio w
  MdBookmark as BookmarkIcon, // d -> IconBookmark w
  MdBookmarkBorder as BookmarkBorderIcon, // d -> IconBookmarkBorder w
  MdSearch as SearchIcon, // d -> IconSearch w
  MdPlayArrow as PlayIcon, // d -> IconPlay w
  MdPause as PauseIcon, // d -> IconPause w
  MdSkipPrevious as RewindIcon, // d -> IconRewind w
  MdClose as CloseIcon, // d -> IconClose w
  MdOpenInNew as NewPageIcon, // d -> IconNewPage w
  MdMood as MoodIcon, // d -> IconMood w
  MdKeyboardArrowDown as ArrowDownIcon, // r -> IconKeyboardArrowDown w
  MdKeyboardArrowUp as ArrowUpIcon, // r -> IconKeyboardArrowUp w
  MdKeyboardArrowLeft as ArrowLeftIcon, // r -> IconKeyboardArrowLeft w
  MdKeyboardArrowRight as ArrowRightIcon, // r -> IconKeyboardArrowRight w
  MdFlag as ReportIcon, // d -> IconReport w
  MdEdit as EditIcon, //d -> IconEdit w
  MdVisibilityOff as UnpublishIcon, // d -> IconUnpublish w
  MdReply as ReplyIcon, // d -> IconReply w
  MdStarBorder as FeaturedIcon, // d -> IconFeatured w
  MdMoreVert as MoreIcon, // r -> IconMoreVertical w
  MdCheck as CheckIcon, // d -> IconCheck w
  MdFilter as GalleryIcon, // d -> IconGallery w
  MdChevronLeft as ChevronLeftIcon, // d -> IconChevronLeft w
  MdChevronRight as ChevronRightIcon, // d -> IconChevronRight w
  MdFullscreen as FullscreenIcon, // d -> IconFullscreen
  MdFullscreenExit as FullscreenExitIcon, // d -> IconFullscreenExit
  MdPodcasts as PodcastIcon, // d -> IconPodcast w
  MdPlayCircleOutline as PlayCircleIcon, // d -> IconPlayCircle w
  MdPauseCircleOutline as PauseCircleIcon, // d -> IconPauseCircle w
  MdQueryBuilder as ReadingTimeIcon, // r -> IconSchedule w
  MdMail as MailIcon, // d -> IconMail w
  MdMailOutline as MailOutlineIcon, // d -> IconMailOutline w
  MdPhonelink as PhonelinkIcon, // r -> IconDevices w
  MdLink as LinkIcon, // d -> IconLink w
  MdHighlightOff as HighlightOffIcon, // r -> IconHighlightOff w
  MdLaunch as LaunchIcon, // r -> IconOpenInNew w
  MdRssFeed as RssFeedIcon, // d -> IconRssFeed w
  MdArrowDownward as ArrowDownwardIcon, // d -> IconArrowDownward w
  MdArrowForward as ArrowForwardIcon, // d -> IconArrowForward w
  MdArrowBack as ArrowBackIcon, // d -> IconArrowBack w
  MdExpandMore as ExpandMoreIcon, //d -> IconExpandMore w
  MdExpandLess as ExpandLessIcon, //d -> IconExpandLess w
  MdDone as DoneIcon, // d -> IconDone w
  MdNotificationsActive as NotificationsActiveIcon, // d -> IconNotificationsActive w
  MdNotificationsActive as FollowIcon, // r -> FollowIcon w
  MdNotifications as NotificationIcon, // d -> IconNotifications w
  MdNotificationsOff as NotificationsOffIcon, //d -> IconNotificationsOff w
  MdNotificationsNone as NotificationsNoneIcon, // r -> IconNotificationsOutline w
  MdRotateLeft as RotateLeftIcon, //d -> IconRotateLeft w
  MdRotateLeft as RevertIcon, // r -> IconRotateLeft w
  MdList as ListIcon, // d -> IconList w
  MdFormatListBulleted as UlIcon, // r -> IconUnorderedList w
  MdFormatListNumbered as OlIcon, // r -> IconOrderedList w
  MdFilterList as FilterListIcon, // d -> IconFilterList w
  MdAdd as AddIcon, // d -> IconAdd w
  MdRemove as RemoveIcon, // d  -> IconRemove w
  MdRemoveCircleOutline as RemoveCircleIcon, // r -> IconRemoveCircle w
  MdAccountBox as AccountBoxIcon, // d -> IconAccountBox w
  MdNoteAdd as NoteAddIcon, // d -> IconNoteAdd w
  MdVpnKey as VpnKeyIcon, // d -> IconVpnKey w
  MdLanguage as LanguageIcon, // d -> IconLanguage w
  MdFavorite as FavoriteIcon, // d -> IconFavorite w
  MdStars as StarsIcon, // d -> IconStars w
  MdTrendingFlat as TrendingFlatIcon, // d -> IconTrendingFlat w
  MdFolder as FolderIcon, // d -> IconFolder w
  MdBrightness2 as DarkmodeIcon, // d -> IconDarkMode w
  MdForward30 as ForwardIcon, // d  -> IconForward w
  MdReplay10 as ReplayIcon, // d -> IconReplay w
  MdCheckCircle as CheckCircleIcon, // d -> IconCheckCircle w
  MdLock as LockIcon, // d -> IconLock w
  MdTextFormat as TextFormatIcon, // r -> IconFormatColorText w
  MdOutlineSmsFailed as EtiquetteIcon, // d -> IconEtiquette w
  MdUnfoldLess as UnfoldLessIcon, // d -> IconUnfoldLess w
  MdUnfoldMore as UnfoldMoreIcon, // d -> IconUnfoldMore w
  MdFormatBold as BoldIcon, // d -> IconFormatBold w
  MdFormatItalic as ItalicIcon, // d -> IconFormatItalic w
  MdKeyboardReturn as BreakIcon, // d -> IconBreak w
  MdOutlineImage as ImageIcon, //  -> IconImage w
  MdFormatQuote as QuoteIcon, // d -> IconFormatQuote w
  MdStrikethroughS as StrikeThrough, // d -> IconFormatStrikethrough w
  MdTitle as TitleIcon, // d -> IconTitle w
  MdCode as CodeIcon, // d -> IconCode w
  MdDragHandle as PunchlineIcon, // r -> IconDragHandle w
  MdOutlineCallToAction as ArticlePreviewIcon, // r -> IconCallToActionOutline w
  MdViewQuilt as FlyerTileIcon, // d -> IconFlyerTile w
  MdViewHeadline as FlyerTileMetaIcon, // d -> IconFlyerTileMeta w
  MdOutlineQuiz as QuizIcon, // d -> IconQuiz w
  MdOutlineDelete as DeleteIcon, // r -> IconDeleteOutline w
  MdRateReview as MemoIcon, // d -> IconMemo w
  MdMic as MicIcon, // d -> IconMic w
  MdPlaylistAdd as PlaylistAddIcon, // d -> IconPlaylistAdd w
  MdPlaylistAddCheck as PlaylistRemoveIcon, // r -> IconPlaylistAddCheck w
  MdDragHandle as DragHandleIcon, // d -> IconDragHandle w
  MdSkipNext as SkipNextIcon, // d -> IconSkipNext w
  MdSubject as ArticleIcon, // d -> IconArticle w
  MdContentCopy as CopyToClippboardIcon, // r -> IconContentCopyOutline w
  MdRadioButtonChecked as RadioCheckedIcon, // d -> IconRadioChecked w
  MdRadioButtonUnchecked as RadioUncheckedIcon, // d -> IconRadioUnchecked w
} from 'react-icons/md'

export {
  FaTelegramPlane as TelegramIcon, // d -> IconTelegram w
  FaSubscript as SubIcon, // d -> IconFormatSubscript w
  FaSuperscript as SupIcon, // d -> IconFormatSuperscript
} from 'react-icons/fa'

export {
  AiFillInstagram as InstagramIcon, // r -> IconInstagram (FontAwesome) w
  AiOutlineCode as BlockCodeIcon, // r -> IconTerminal (MaterialDesign) w
} from 'react-icons/ai'
export { SiThreema as ThreemaIcon } from 'react-icons/si' // d -> IconThreema
export { DiOpensource as OpenSourceIcon } from 'react-icons/di' // d -> IconOpenSource w
export { BiParagraph as ParagraphIcon } from 'react-icons/bi' // d -> IconParagraph w

// Separately export io icons to prevent a re-export conflict
// caused by react-icons export both io4 and io5 on the /all path.
// This causes duplicate exports which causes a rollup error.
export {
  IoLogoTwitter as TwitterIcon, // d -> IconTwitter w
  IoLogoYoutube as YoutubeIcon, // d -> IconYoutube w
  IoLogoVimeo as VimeoIcon, // d -> IconVimeo w
  IoLogoWhatsapp as WhatsappIcon, // d -> IconWhatsapp w
  IoLogoGoogle as GoogleIcon, // d -> IconGoogle w
  IoLogoApple as AppleIcon, // d -> IconApple w
  IoLogoFacebook as FacebookIcon, // d -> IconFacebook w
} from 'react-icons/io5'

export { BsBlockquoteLeft as BlockQuoteIcon } from 'react-icons/bs' // d -> IconFormatBlockQuote w

export { ShareIcon } from './CustomIcons/ShareIcon' // d -> IconShare w
export { MarkdownIcon } from './CustomIcons/MarkdownIcon' // d -> IconMarkdown w
export { BackIcon } from './CustomIcons/BackIcon' // d -> IconBack w
export { DiscussionIcon } from './CustomIcons/DiscussionIcon' // d -> IconDiscussion w
export { FontSizeIcon } from './CustomIcons/FontSizeIcon' // d -> IconFontSize w
export { CheckSmallIcon } from './CustomIcons/MdCheckSmall' // d -> IconCheckSmall w
export { ReadIcon } from './CustomIcons/MdCheckCircleOutlined' // d -> IconRead w
export { ChartIcon } from './CustomIcons/MdInsertChartOutlined' // d -> IconChart w
export { SearchMenuIcon } from './CustomIcons/SearchMenuIcon' // d -> IconSearchMenu w
export { SpotifyIcon } from './CustomIcons/SpotifyIcon' // d -> IconSpotify w
export { BoldSearchIcon } from './CustomIcons/BoldSearchIcon' // d -> IconSearchMenuBold w

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
