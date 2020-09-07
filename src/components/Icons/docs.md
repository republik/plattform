## Icons

- `fill`: fill for icon, default inherit
- `size`: size, default is "1em"


The default Icon style is Material. For brands we rely on Ionic icons. There are a couple of custom icons, some which are Material, but are not yet part of react-icons, some which are custom creations but comply with Material stroke width and padding.


```react
<div>
<Interaction.H3>Article</Interaction.H3>
<IconButton Icon={PdfIcon} label="Pdf" />
<IconButton Icon={ShareIcon} label="Share"/>
<IconButton Icon={AudioIcon} label="Adio" />
<IconButton Icon={BookmarkIcon} label="Bookmark" />
<IconButton Icon={NotificationIcon} label="Play" />
<IconButton Icon={GalleryIcon} label="Gallery" />
<IconButton Icon={CheckIcon} label="Check" />
<IconButton Icon={EditIcon} label="Edit" />
<IconButton Icon={FolderOpenIcon} label="Dossier Folder" />

<br />
<Interaction.H3>UI Actions</Interaction.H3>
<IconButton Icon={CloseIcon} label="Close" />
<IconButton Icon={SearchIcon} label="Search" />
<IconButton Icon={ChevronLeftIcon} label="Chevron Left" />
<IconButton Icon={ChevronRightIcon} label="Chevron Right" />
<IconButton Icon={FullscreenIcon} label="Fullscreen" />
<IconButton Icon={FullscreenExitIcon} label="Fullscreen Exit" />

<br />
<Interaction.H3>Media</Interaction.H3>
<IconButton Icon={PlayIcon} label="Play" />
<IconButton Icon={PauseIcon} label="Pause" />
<IconButton Icon={RewindIcon} label="Rewind" />
<IconButton Icon={DownloadIcon} label="Download" />
<IconButton Icon={NewPageIcon} label="New Page" />

<br />
<Interaction.H3>Discussion</Interaction.H3>
<IconButton Icon={UnpublishIcon} label="Unpublish" />
<IconButton Icon={ReplyIcon} label="Reply" />
<IconButton Icon={FeaturedIcon} label="Featured" />
<IconButton Icon={ArrowDownIcon} label="Arrow Down" />
<IconButton Icon={ArrowUpIcon} label="Arrow Up" />
<IconButton Icon={ReportIcon} label="Report" />
<IconButton Icon={MarkdownIcon} label="Markdown" />
<IconButton Icon={MoodIcon} label="Mood" />

<br />
<Interaction.H3>Social Media</Interaction.H3>
<IconButton Icon={TwitterIcon} label="Twitter" />
<IconButton Icon={VimeoIcon} label="Vimeo" />
<IconButton Icon={YoutubeIcon} label="Play" />
</div>
```