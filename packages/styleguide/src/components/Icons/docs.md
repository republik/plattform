## IconContextProvider

The styleguide exports `IconContextProvider`, which can be wrapped around an app to provide default props, like inline styles, for icons.

```code|lang-js
import {
  IconContextProvider
} from '@project-r/styleguide/icons'
```

We assume a context providing `{ style: { verticalAlign: 'middle' }}` is wrapped around the app or frame where the style guide is used for icons to align nicely. For additional options see the [`@react-icons/all-files` readme](https://www.npmjs.com/package/@react-icons/all-files#configuration).

```react
<IconContextProvider value={{ style: { verticalAlign: 'middle' } }}>
  <PdfIcon />
</IconContextProvider>
```

## Icon

- `fill`: fill for icon, default inherit
- `size`: size, default is "1em"

The default Icon style is Material. For brands we rely on Ionic icons. There are a couple of custom icons, some which are Material, but are not yet part of react-icons, some which are custom creations but comply with Material stroke width and padding.

```react
<div>
<Interaction.H3>Article</Interaction.H3>
<IconButton Icon={DiscussionIcon} label="DiscussionIcon" />
<IconButton Icon={PdfIcon} label="PdfIcon" />
<IconButton Icon={FontSizeIcon} label="FontSizeIcon" />
<IconButton Icon={ShareIcon} label="ShareIcon"/>
<IconButton Icon={AudioIcon} label="AudioIcon" />
<IconButton Icon={BookmarkIcon} label="BookmarkIcon" />
<IconButton Icon={BookmarkBorderIcon} label="BookmarkBorderIcon" />
<IconButton Icon={NotificationIcon} label="NotificationIcon" />
<IconButton Icon={NotificationsOffIcon} label="NotificationsOffIcon" />
<IconButton Icon={NotificationsNoneIcon} label="NotificationsNoneIcon" />
<IconButton Icon={NotificationsActiveIcon} label="NotificationsActiveIcon || FollowIcon" />
<IconButton Icon={GalleryIcon} label="GalleryIcon" />
<IconButton Icon={CheckIcon} label="CheckIcon" />
<IconButton Icon={CheckSmallIcon} label="CheckSmallIcon" />
<IconButton Icon={ReadIcon} label="ReadIcon" />
<IconButton Icon={EditIcon} label="EditIcon" />
<IconButton Icon={ChartIcon} label="ChartIcon" />
<IconButton Icon={ReadingTimeIcon} label="ReadingTimeIcon" />
<IconButton Icon={FolderIcon} label="FolderIcon" />

<br />
<Interaction.H3>UI Actions</Interaction.H3>
<IconButton Icon={DarkmodeIcon} label="DarkmodeIcon" />
<IconButton Icon={SearchMenuIcon} label="SearchMenuIcon" />
<IconButton Icon={BackIcon} label="BackIcon" />
<IconButton Icon={CloseIcon} label="CloseIcon" />
<IconButton Icon={SearchIcon} label="SearchIcon" />
<IconButton Icon={FullscreenIcon} label="FullscreenIcon" />
<IconButton Icon={FullscreenExitIcon} label="FullscreenExitIcon" />
<IconButton Icon={RotateLeftIcon} label="RotateLeftIcon || RevertIcon" />
<IconButton Icon={ListIcon} label="ListIcon" />
<IconButton Icon={FilterListIcon} label="FilterListIcon" />
<IconButton Icon={AddIcon} label="AddIcon" />
<IconButton Icon={RemoveIcon} label="RemoveIcon" />
<IconButton Icon={AccountBoxIcon} label="AccountBoxIcon" />
<IconButton Icon={CheckCircleIcon} label="CheckCircleIcon" />

<br />
<Interaction.H3>Arrows</Interaction.H3>
<IconButton Icon={ArrowDownwardIcon} label="ArrowDownwardIcon" />
<IconButton Icon={ArrowForwardIcon} label="ArrowForwardIcon" />
<IconButton Icon={ExpandMoreIcon} label="ExpandMoreIcon" />
<IconButton Icon={ExpandLessIcon} label="ExpandLessIcon" />
<IconButton Icon={ChevronLeftIcon} label="ChevronLeftIcon" />
<IconButton Icon={ChevronRightIcon} label="ChevronRightIcon" />
<IconButton Icon={ArrowLeftIcon} label="ArrowLeftIcon" />
<IconButton Icon={ArrowRightIcon} label="ArrowRightIcon" />

<br />
<Interaction.H3>Media</Interaction.H3>
<IconButton Icon={PlayIcon} label="PlayIcon" />
<IconButton Icon={ForwardIcon} label="ForwardIcon" />
<IconButton Icon={ReplayIcon} label="ReplayIcon" />
<IconButton Icon={PauseIcon} label="PauseIcon" />
<IconButton Icon={RewindIcon} label="RewindIcon" />
<IconButton Icon={DownloadIcon} label="DownloadIcon" />
<IconButton Icon={NewPageIcon} label="NewPageIcon" />
<IconButton Icon={PodcastIcon} label="PodcastIcon" />
<IconButton Icon={PlayCircleIcon} label="PlayCircleIcon" />

<br />
<Interaction.H3>Discussion</Interaction.H3>
<IconButton Icon={UnpublishIcon} label="UnpublishIcon" />
<IconButton Icon={ReplyIcon} label="ReplyIcon" />
<IconButton Icon={FeaturedIcon} label="FeaturedIcon" />
<IconButton Icon={ArrowDownIcon} label="ArrowDownIcon" />
<IconButton Icon={ArrowUpIcon} label="ArrowUpIcon" />
<IconButton Icon={ReportIcon} label="ReportIcon" />
<IconButton Icon={TextFormatIcon} label="TextFormatIcon" />
<IconButton Icon={EtiquetteIcon} label="EtiquetteIcon" />
<IconButton Icon={MoodIcon} label="MoodIcon" />

<br />
<Interaction.H3>Social & Share</Interaction.H3>
<IconButton Icon={TwitterIcon} label="TwitterIcon" />
<IconButton Icon={MastodonIcon} label="MastodonIcon" />
<IconButton Icon={WhatsappIcon} label="WhatsappIcon" />
<IconButton Icon={VimeoIcon} label="VimeoIcon" />
<IconButton Icon={YoutubeIcon} label="YoutubeIcon" />
<IconButton Icon={SpotifyIcon} label="SpotifyIcon" />
<IconButton Icon={GoogleIcon} label="GoogleIcon" />
<IconButton Icon={AppleIcon} label="AppleIcon" />
<IconButton Icon={FacebookIcon} label="FacebookIcon" />
<IconButton Icon={InstagramIcon} label="InstagramIcon" />
<IconButton Icon={TelegramIcon} label="TelegramIcon" />
<IconButton Icon={ThreemaIcon} label="ThreemaIcon" />
<IconButton Icon={MailIcon} label="MailIcon" />
<IconButton Icon={MailOutlineIcon} label="MailOutlineIcon" />
<IconButton Icon={LinkIcon} label="LinkIcon" />
<IconButton Icon={RssFeedIcon} label="RssFeedIcon" />
<IconButton Icon={OpenSourceIcon} label="OpenSourceIcon" />

<br />
<Interaction.H3>User</Interaction.H3>
<IconButton Icon={NoteAddIcon} label="NoteAddIcon" />
<IconButton Icon={VpnKeyIcon} label="VpnKeyIcon" />
<IconButton Icon={LanguageIcon} label="LanguageIcon" />
<IconButton Icon={LockIcon} label="LockIcon" />

<br />
<Interaction.H3>Campaigns</Interaction.H3>
<IconButton Icon={FavoriteIcon} label="FavoriteIcon" />
<IconButton Icon={StarsIcon} label="StarsIcon" />
<IconButton Icon={TrendingFlatIcon} label="TrendingFlatIcon" />
<IconButton Icon={PhonelinkIcon} label="PhonelinkIcon" />
<IconButton Icon={HighlightOffIcon} label="HighlightOffIcon" />
<IconButton Icon={LaunchIcon} label="LaunchIcon" />
<IconButton Icon={DoneIcon} label="DoneIcon" />
</div>
```