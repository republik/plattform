'use client'

import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { css } from '@republik/theme/css'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react'

/**
 * Mirrors the `md` theme breakpoint. Below it the menu is a bottom sheet, above
 * it a menu anchored to its trigger.
 */
const DESKTOP_QUERY = '(min-width: 768px)'

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(DESKTOP_QUERY)
  mediaQuery.addEventListener('change', onChange)
  return () => mediaQuery.removeEventListener('change', onChange)
}

/**
 * The two layouts need different Radix primitives, so this can't be a media
 * query. Server and first client render assume the sheet: while the menu is
 * closed only the trigger is mounted, and that is identical either way, so the
 * switch after hydration is invisible.
 */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  )
}

const IsDesktopContext = createContext(false)

const panelStyle = css({
  backgroundColor: 'background.overlay',
  boxShadow: 'md',
  color: 'text',
  minWidth: '12rem',
  paddingY: '2',
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
})

const triggerStyle = css({
  cursor: 'pointer',
  display: 'inline-flex',
})

const itemStyle = css({
  alignItems: 'center',
  color: 'text',
  cursor: 'pointer',
  display: 'flex',
  gap: '3',
  // Token, not `14px`: see the same note in `action-button.tsx`.
  fontSize: 's',
  fontWeight: 'regular',
  outline: 'none',
  paddingX: '5',
  paddingY: '3',
  textAlign: 'left',
  textDecoration: 'none',
  textStyle: 'sans',
  width: 'full',
  '&[data-highlighted], &:hover': {
    backgroundColor: 'hover',
  },
  '&[data-disabled], &:disabled': {
    color: 'disabled',
    cursor: 'not-allowed',
  },
  '& > svg': {
    flexShrink: 0,
  },
})

export type ActionMenuProps = {
  /** Accessible name of the menu, also used as the trigger's label. */
  title: string
  /** Rendered inside the trigger button — an icon in most cases. */
  trigger: ReactNode
  /** Which trigger edge the desktop menu aligns to. */
  align?: 'start' | 'center' | 'end'
  children: ReactNode
}

export function ActionMenu({
  title,
  trigger,
  align = 'end',
  children,
}: ActionMenuProps) {
  const isDesktop = useIsDesktop()
  const [isOpen, setOpen] = useState(false)

  // Swapping primitives while the sheet is open unmounts Radix's Dialog
  // mid-teardown and strands `pointer-events: none` on <body>. Freeze the
  // layout until the menu is closed, then adopt the new one.
  const [isSheet, setIsSheet] = useState(true)
  useEffect(() => {
    if (!isOpen) {
      setIsSheet(!isDesktop)
    }
  }, [isDesktop, isOpen])

  return (
    <IsDesktopContext.Provider value={!isSheet}>
      {isSheet ? (
        <Dialog.Root open={isOpen} onOpenChange={setOpen}>
          <Dialog.Trigger aria-label={title} className={triggerStyle}>
            {trigger}
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay
              className={css({
                backgroundColor: 'overlay',
                inset: 0,
                position: 'fixed',
                // Same stacking plane as `ui/overlay.tsx`. Anything lower is
                // covered by the campaign paynote, fixed to the bottom at 9998.
                zIndex: 99998,
                _stateOpen: { animation: 'fadeIn' },
              })}
            />
            <Dialog.Content
              aria-describedby={undefined}
              className={css({
                backgroundColor: 'background.overlay',
                bottom: 0,
                boxShadow: 'overlay',
                color: 'text',
                left: 0,
                paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))',
                paddingLeft: 'env(safe-area-inset-left)',
                paddingRight: 'env(safe-area-inset-right)',
                paddingTop: '4',
                position: 'fixed',
                right: 0,
                zIndex: 99999,
                _stateOpen: { animation: 'slideUp' },
              })}
            >
              <VisuallyHidden>
                <Dialog.Title>{title}</Dialog.Title>
              </VisuallyHidden>
              {children}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : (
        <DropdownMenu.Root open={isOpen} onOpenChange={setOpen} modal={false}>
          <DropdownMenu.Trigger aria-label={title} className={triggerStyle}>
            {trigger}
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align={align}
              sideOffset={8}
              collisionPadding={16}
              className={panelStyle}
            >
              {children}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </IsDesktopContext.Provider>
  )
}

export type ActionMenuItemProps = {
  /** Leading icon, e.g. `<IconStar size={18} />`. */
  icon?: ReactNode
  children: ReactNode
  /** Renders the item as a link. Takes precedence over `onSelect`. */
  href?: string
  /** Only meaningful together with `href`. */
  target?: string
  onSelect?: () => void
  disabled?: boolean
}

export function ActionMenuItem({
  icon,
  children,
  href,
  target,
  onSelect,
  disabled,
}: ActionMenuItemProps) {
  const isDesktop = useContext(IsDesktopContext)

  const content = (
    <>
      {icon}
      {children}
    </>
  )

  if (href) {
    const link = (
      <a
        className={itemStyle}
        href={href}
        onClick={onSelect}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        target={target}
      >
        {content}
      </a>
    )
    // Radix closes the dropdown item on select by itself; the sheet needs Close.
    return isDesktop ? (
      <DropdownMenu.Item asChild disabled={disabled}>
        {link}
      </DropdownMenu.Item>
    ) : (
      <Dialog.Close asChild>{link}</Dialog.Close>
    )
  }

  if (isDesktop) {
    return (
      <DropdownMenu.Item
        className={itemStyle}
        disabled={disabled}
        onSelect={onSelect}
      >
        {content}
      </DropdownMenu.Item>
    )
  }

  return (
    <Dialog.Close asChild>
      <button
        className={itemStyle}
        disabled={disabled}
        onClick={onSelect}
        type='button'
      >
        {content}
      </button>
    </Dialog.Close>
  )
}
