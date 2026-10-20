'use client'

import { usePaynotes } from '@/app/(sanity)/components/paynotes/paynotes-context'
import { Button } from '@/app/components/ui/button'
import { Overlay } from '@/app/components/ui/overlay'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { PUBLIC_BASE_URL, SCREENSHOT_SERVER_BASE_URL } from '@/lib/constants'
import * as Dialog from '@radix-ui/react-dialog'
import { css, cx } from '@republik/theme/css'
import { FileDown } from 'lucide-react'
import { useId, useState } from 'react'
import { ACTION_ICON_SIZE, actionStyle } from './action-style'

type PdfFormat = 'A4' | 'A5'

function getArticlePdfUrl({
  path,
  version,
  format,
  images,
}: {
  path: string
  version?: string
  format: PdfFormat
  images: boolean
}): string {
  const pdfUrl = new URL('/api/pdf', SCREENSHOT_SERVER_BASE_URL)
  pdfUrl.searchParams.set('url', new URL(path, PUBLIC_BASE_URL).toString())
  if (version) {
    pdfUrl.searchParams.set('version', version)
  }
  pdfUrl.searchParams.set('images', String(images))
  pdfUrl.searchParams.set('format', format)
  return pdfUrl.toString()
}

export function PdfDownloadAction({
  onClick,
  className,
}: {
  onClick: () => void
  /** Overrides the standalone look, e.g. when embedded in a menu. */
  className?: string
}) {
  const { hasPaywall } = usePaynotes()

  // Not signed in, or trial ended: reader is looking at a paywall, so the
  // full text isn't theirs to download.
  if (hasPaywall) {
    return null
  }

  return (
    <button
      className={cx(actionStyle, className)}
      onClick={onClick}
      type='button'
    >
      <FileDown size={ACTION_ICON_SIZE} />
      PDF herunterladen
    </button>
  )
}

export function PdfDownloadDialog({
  path,
  version,
  open,
  onOpenChange,
}: {
  path: string
  version?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const trackEvent = useTrackEvent()
  const [format, setFormat] = useState<PdfFormat>('A4')
  const [images, setImages] = useState(false)
  const pdfHref = getArticlePdfUrl({ path, version, format, images })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Overlay>
          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '6',
            })}
          >
            <Dialog.Title className={css({ textStyle: 'h2Sans' })}>
              PDF herunterladen
            </Dialog.Title>
            <OptionGroup<PdfFormat>
              legend='Format'
              value={format}
              onChange={setFormat}
              options={[
                { value: 'A4', label: 'A4' },
                { value: 'A5', label: 'A5' },
              ]}
            />
            <OptionGroup<'with' | 'without'>
              legend='Bilder'
              value={images ? 'with' : 'without'}
              onChange={(value) => setImages(value === 'with')}
              options={[
                { value: 'with', label: 'Mit Bildern' },
                { value: 'without', label: 'Ohne Bilder' },
              ]}
            />

            <Button asChild>
              <a
                href={pdfHref}
                onClick={() => {
                  trackEvent({ action: 'pdfDownload', name: path })
                  onOpenChange(false)
                }}
                rel='noopener noreferrer'
                target='_blank'
              >
                Herunterladen
              </a>
            </Button>
          </div>
        </Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function OptionGroup<T extends string>({
  legend,
  value,
  onChange,
  options,
}: {
  legend: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  const legendId = useId()

  return (
    <div role='group' aria-labelledby={legendId}>
      <div
        id={legendId}
        className={css({
          color: 'text.secondary',
          fontSize: 's',
          fontWeight: 'medium',
          marginBottom: '2',
        })}
      >
        {legend}
      </div>
      <div className={css({ display: 'flex', gap: '2' })}>
        {options.map((option) => (
          <Button
            key={option.value}
            type='button'
            size='small'
            variant={value === option.value ? 'default' : 'outline'}
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={css({ flex: 1 })}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
