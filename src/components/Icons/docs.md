- `fill`: fill for icon, default inherit
- `size`: size, default is "1em"


The default Icon style is Material. For brands we rely on Ionic icons. There are a couple of custom icons, some which are Material, but are not yet part of react-icons, some which are custom creations but comply with Material stroke width and padding.


```react
<div>
<Interaction.H3>Article</Interaction.H3>
<IconButton Icon={DiscussionIcon} label="Discussion" />
<IconButton Icon={PdfIcon} label="Pdf" />
<IconButton Icon={FontSizeIcon} label="Fontsize" />
<IconButton Icon={ShareIcon} label="Share"/>
<IconButton Icon={AudioIcon} label="Audio" />
<IconButton Icon={BookmarkIcon} label="Bookmark set" />
<IconButton Icon={BookmarkBorderIcon} label="Bookmark unset" />
<IconButton Icon={NotificationIcon} label="Play" />
<IconButton Icon={GalleryIcon} label="Gallery" />
<IconButton Icon={CheckIcon} label="Check" />
<IconButton Icon={CheckSmallIcon} label="Small Check" />
<IconButton Icon={ReadIcon} label="Read" />
<IconButton Icon={EditIcon} label="Edit" />
<IconButton Icon={ChartIcon} label="Charts" />
<IconButton Icon={ReadingTimeIcon} label="Reading Time" />
<IconButton Icon={NotificationsOffIcon} label="Notifications Off" />
<IconButton Icon={NotificationsNoneIcon} label="Notifications None" />
<IconButton Icon={NotificationsActiveIcon} label="Notifications Active" />
<IconButton Icon={FolderOpenIcon} label="Dossier Folder" />

<br />
<Interaction.H3>UI Actions</Interaction.H3>
<IconButton Icon={SearchMenuIcon} label="SearchMenu" />
<IconButton Icon={BackIcon} label="Back" />
<IconButton Icon={CloseIcon} label="Close" />
<IconButton Icon={SearchIcon} label="Search" />
<IconButton Icon={FullscreenIcon} label="Fullscreen" />
<IconButton Icon={FullscreenExitIcon} label="Fullscreen Exit" />
<IconButton Icon={RotateLeftIcon} label="Rotate" />
<IconButton Icon={ListIcon} label="List" />
<IconButton Icon={FilterListIcon} label="Filter" />
<IconButton Icon={AddIcon} label="Add" />
<IconButton Icon={RemoveIcon} label="Remove" />
<IconButton Icon={AccountBoxIcon} label="No Account" />

<br />
<Interaction.H3>Arrows</Interaction.H3>
<IconButton Icon={ArrowDownwardIcon} label="Arrow Downward" />
<IconButton Icon={ArrowForwardIcon} label="Arrow Forward" />
<IconButton Icon={ExpandMoreIcon} label="Expand more" />
<IconButton Icon={ExpandLessIcon} label="Expand less" />
<IconButton Icon={ChevronLeftIcon} label="Chevron Left" />
<IconButton Icon={ChevronRightIcon} label="Chevron Right" />
<IconButton Icon={KeyboardArrowLeftIcon} label="Keyboard Arrow Left" />
<IconButton Icon={KeyboardArrowRightIcon} label="Keyboard Arrow Right" />

<br />
<Interaction.H3>Media</Interaction.H3>
<IconButton Icon={PlayIcon} label="Play" />
<IconButton Icon={PauseIcon} label="Pause" />
<IconButton Icon={RewindIcon} label="Rewind" />
<IconButton Icon={DownloadIcon} label="Download" />
<IconButton Icon={NewPageIcon} label="New Page" />
<IconButton Icon={PodcastIcon} label="Podcast" />
<IconButton Icon={PlayCircleIcon} label="Play Circle" />

<br />
<Interaction.H3>Discussion</Interaction.H3>
<IconButton Icon={UnpublishIcon} label="Unpublish" />
<IconButton Icon={ReplyIcon} label="Reply" />
<IconButton Icon={FeaturedIcon} label="Featured" />
<IconButton Icon={ArrowDownIcon} label="Arrow Down" />
<IconButton Icon={ArrowUpIcon} label="Arrow Up" />
<IconButton Icon={ReportIcon} label="Report" />
<IconButton Icon={MarkdownIcon} label="Markdown" />
<IconButton Icon={EtiquetteIcon} label="Etiquette" />
<IconButton Icon={MoodIcon} label="Mood" />

<br />
<Interaction.H3>Social & Share</Interaction.H3>
<IconButton Icon={TwitterIcon} label="Twitter" />
<IconButton Icon={WhatsappIcon} label="Whatsapp" />
<IconButton Icon={VimeoIcon} label="Vimeo" />
<IconButton Icon={YoutubeIcon} label="Youtube" />
<IconButton Icon={SpotifyIcon} label="Spotify" />
<IconButton Icon={LogoGoogleIcon} label="Google" />
<IconButton Icon={LogoAppleIcon} label="Apple" />
<IconButton Icon={LogoFacebookIcon} label="Facebook" />
<IconButton Icon={MailIcon} label="Mail Filled" />
<IconButton Icon={MailOutlineIcon} label="Mail Outlined" />
<IconButton Icon={LinkIcon} label="Link" />
<IconButton Icon={RssFeedIcon} label="Rss Feed" />

<br />
<Interaction.H3>User</Interaction.H3>
<IconButton Icon={NoteAddIcon} label="Support" />
<IconButton Icon={VpnKeyIcon} label="Secure" />
<IconButton Icon={LanguageIcon} label="Website" />

<br />
<Interaction.H3>Campaigns</Interaction.H3>
<IconButton Icon={FavoriteIcon} label="Favorite" />
<IconButton Icon={StarsIcon} label="Star" />
<IconButton Icon={TrendingFlatIcon} label="Trending" />
<IconButton Icon={PhonelinkIcon} label="Phonelink" />
<IconButton Icon={HighlightOffIcon} label="Highlight Off" />
<IconButton Icon={LaunchIcon} label="Launch" />
<IconButton Icon={DoneIcon} label="Done" />
</div>
```