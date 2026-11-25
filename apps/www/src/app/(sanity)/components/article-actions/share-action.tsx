'use client'

import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { usePostMessage } from '@/app/lib/hooks/usePostMessage'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import copyToClipboard from 'clipboard-copy'
import { Link, Share as ShareIcon } from 'lucide-react'
import { useState } from 'react'
import {
  ACTION_ICON_SIZE,
  actionLabelStyle,
  actionStyle,
  noteStyle,
} from './action-style'
import { getShareTargets } from './share-targets'

export type ShareActionProps = {
  title: string
  path: string
}

export function ShareAction({ title, path }: ShareActionProps) {
  const url = new URL(path, PUBLIC_BASE_URL).toString();
  const emailSubject = `Republik: ${title}`;
  const { isNativeApp } = usePlatformInformation();
  const postMessage = usePostMessage();
  const trackEvent = useTrackEvent();
  const [linkCopied, setLinkCopied] = useState(false);

  // The app has its own native share sheet — no picker to render, just hand
  // the URL over.
  if (isNativeApp) {
    return (
      <button
        className={actionStyle}
        onClick={() => {
          trackEvent({ action: "shareNative", name: url });
          postMessage({
            type: "share",
            payload: {
              title,
              url,
              subject: emailSubject,
              dialogTitle: "Teilen"
            }
          });
        }}
        type="button"
      >
        <ShareIcon size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>Teilen</span>
      </button>
    );
  }

  const shareLinks = getShareTargets(url, emailSubject);

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger aria-label="Teilen" className={actionStyle}>
        <ShareIcon size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>Teilen</span>
      </Menu.Trigger>
      <Menu.Content title="Teilen">
        <p className={noteStyle}>
          Teilen Sie einen Link, auf den nur Abonnenten die Republik Zugriff haben.
        </p>
        <Menu.Item asChild>
          <a
            className={menuItemStyle}
            href={url}
            onClick={(e) => {
              e.preventDefault();
              trackEvent({ action: "shareButton:copyLink", name: url });
              copyToClipboard(url).then(() => setLinkCopied(true));
            }}
          >
            <Link size={ACTION_ICON_SIZE} />
            {linkCopied ? "Link kopiert" : "Link kopieren"}
          </a>
        </Menu.Item>
        {shareLinks.map(({ name, href, icon: Icon, label }) => (
          <Menu.Item asChild key={name}>
            <a
              className={menuItemStyle}
              href={href}
              onClick={() =>
                trackEvent({ action: `shareButton:${name}`, name: url })
              }
              rel="noreferrer"
              target="_blank"
            >
              <Icon size={ACTION_ICON_SIZE} />
              {label}
            </a>
          </Menu.Item>
        ))}
      </Menu.Content>
    </Menu.Root>
  );
}
