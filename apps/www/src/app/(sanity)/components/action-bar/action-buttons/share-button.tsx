import { Share } from '@/app/components/share/share'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import { Share as ShareIcon } from 'lucide-react'
import { ACTION_ICON_SIZE, actionButtonStyle } from './action-button'

export function ShareButton({ title, path }: { title: string; path: string }) {
  const url = new URL(path, PUBLIC_BASE_URL).toString()
  return (
    // `Share` renders its own <button> around the children, so this must stay
    // a <span> — a nested button would be split apart by the HTML parser.
    <Share title={title} url={url} emailSubject={`Republik: ${title}`}>
      <span className={actionButtonStyle}>
        <ShareIcon size={ACTION_ICON_SIZE} />
        Teilen
      </span>
    </Share>
  )
}
