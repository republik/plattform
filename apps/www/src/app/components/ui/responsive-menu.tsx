'use client'

import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { iosAppSafeAreaBottomPaddingStyle } from '@/app/lib/styles/ios-app-safe-area'
import * as Dialog from '@radix-ui/react-dialog'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Slot } from '@radix-ui/react-slot'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { css, cx } from '@republik/theme/css'
import {
  type ComponentPropsWithoutRef,
  createContext,
  forwardRef,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

/**
 * Same breakpoint as Panda's default `md` token (768px) and the legacy
 * styleguide's `mUp`/`onlyS` split — kept as a literal so this hook doesn't
 * need to agree with either config, just the pixel value both already use.
 */
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)'

/**
 * Deliberately does NOT use the shared `useMediaQuery` from
 * `@project-r/styleguide` — that hook reads `window.matchMedia` synchronously
 * in its `useState` initializer, so on the very first client render (the one
 * hydration reconciles against) it already reflects the real viewport. Since
 * `Menu.Root` swaps its underlying primitive (`DropdownMenu` vs `Dialog`)
 * rather than just its styling, that would mismatch the server's always-desktop
 * guess and trip React's hydration-mismatch check. Starting at `true` here and
 * only correcting after mount keeps the first client render identical to the
 * server's, at the cost of a one-time swap right after mount on mobile.
 */
function useIsDesktopMenu() {
  const [isDesktop, setIsDesktop] = useState(true)

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MEDIA_QUERY)
    setIsDesktop(mql.matches)
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

const menuPanelStyle = css({
  backgroundColor: 'background.overlay',
  boxShadow: 'overlay',
  color: 'text',
  minWidth: '12rem',
  maxWidth: '18rem',
  paddingY: '2',
  zIndex: 10000,
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
})

const drawerOverlayStyle = css({
  backgroundColor: 'overlay',
  position: 'fixed',
  inset: 0,
  display: 'grid',
  placeItems: 'end stretch',
  zIndex: 10000,
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
})

// `env(safe-area-inset-bottom)` in `drawerContentStyle`'s margin doesn't
// resolve inside the native app's `react-native-webview`, so the sheet sits
// under the home indicator there. `iosAppSafeAreaBottomPaddingStyle` adds the
// missing inset as padding on the overlay instead of a margin on the content:
// padding only shrinks the grid's content area (pushing the `end`-aligned
// content up), whereas a margin on the overlay itself — `position: fixed;
// inset: 0` — would shrink the overlay's own box away from the bottom edge,
// exposing whatever sits behind it there instead of the backdrop.
const drawerContentStyle = css({
  backgroundColor: 'background.overlay',
  boxShadow: 'md',
  color: 'text',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  maxHeight: '80dvh',
  overflow: 'hidden',
  willChange: 'transform',
  _stateOpen: { animation: 'slideUp' },
  _stateClosed: { animation: 'slideDown' },
})

const drawerScrollStyle = css({
  maxHeight: '100%',
  overflowY: 'auto',
  paddingTop: '2',
  paddingBottom: '2',
})

const drawerHandleStyle = css({
  backgroundColor: 'disabled',
  borderRadius: '9999px',
  height: '1',
  marginX: 'auto',
  marginBottom: '2',
  width: '9',
})

const drawerTitleStyle = css({
  fontWeight: 'medium',
  paddingX: '5',
  paddingBottom: '2',
  textStyle: 'sans',
})

export const menuItemStyle = css({
  alignItems: 'center',
  color: 'text',
  cursor: 'pointer',
  display: 'flex',
  gap: '3',
  fontSize: 's',
  fontWeight: 'regular',
  outline: 'none',
  paddingX: '5',
  paddingY: '3',
  textAlign: 'left',
  textDecoration: 'none',
  textStyle: 'sans',
  width: 'full!',
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

type MenuContextValue = {
  isDesktop: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

function useMenuContext(component: string) {
  const context = useContext(MenuContext)
  if (!context) {
    throw new Error(`Menu.${component} must be rendered inside Menu.Root`)
  }
  return context
}

type MenuRootProps = {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  /** Forwarded to the desktop `DropdownMenu.Root` only; mobile's `Dialog.Root` is always non-modal. */
  modal?: boolean
}

function Root({
  children,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  modal = false,
}: MenuRootProps) {
  const isDesktop = useIsDesktopMenu()

  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const open = openProp ?? uncontrolledOpen
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next)
    onOpenChange?.(next)
  }

  const contextValue: MenuContextValue = {
    isDesktop,
    open,
    onOpenChange: setOpen,
  }

  return (
    <MenuContext.Provider value={contextValue}>
      {isDesktop ? (
        <DropdownMenu.Root modal={modal} open={open} onOpenChange={setOpen}>
          {children}
        </DropdownMenu.Root>
      ) : (
        <Dialog.Root open={open} onOpenChange={setOpen}>
          {children}
        </Dialog.Root>
      )}
    </MenuContext.Provider>
  )
}

type MenuTriggerProps = ComponentPropsWithoutRef<'button'> & {
  asChild?: boolean
}

const Trigger = forwardRef<HTMLButtonElement, MenuTriggerProps>(
  function Trigger(props, ref) {
    const { isDesktop } = useMenuContext('Trigger')
    return isDesktop ? (
      <DropdownMenu.Trigger ref={ref} {...props} />
    ) : (
      <Dialog.Trigger ref={ref} {...props} />
    )
  },
)

type MenuContentProps = {
  children: ReactNode
  title?: string
  className?: string
  /** Desktop-only: e.g. `ShareAction`'s `menuOffsetX` nudges the anchored dropdown sideways. Ignored on mobile — the drawer's own slide animation owns `transform`, and the panel always stretches full-width regardless of trigger position. */
  style?: React.CSSProperties
}

function Content({ children, title, className, style }: MenuContentProps) {
  const { isDesktop } = useMenuContext('Content')
  const { isIOSApp } = usePlatformInformation()

  if (isDesktop) {
    return (
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          sideOffset={16}
          collisionPadding={16}
          className={cx(menuPanelStyle, className)}
          style={style}
        >
          {children}
          <DropdownMenu.Arrow
            className={css({ fill: 'background', boxShadow: 'md' })}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    )
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay
        className={cx(
          drawerOverlayStyle,
          isIOSApp && iosAppSafeAreaBottomPaddingStyle,
        )}
      >
        <Dialog.Content
          aria-describedby={undefined}
          className={cx(drawerContentStyle, className)}
        >
          <div className={drawerScrollStyle}>
            <div className={drawerHandleStyle} />
            {title ? (
              <Dialog.Title className={drawerTitleStyle}>{title}</Dialog.Title>
            ) : (
              <VisuallyHidden asChild>
                <Dialog.Title>Menü</Dialog.Title>
              </VisuallyHidden>
            )}
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Portal>
  )
}

type MenuItemProps = ComponentPropsWithoutRef<'div'> & {
  asChild?: boolean
  onSelect?: (event: Event) => void
  /** Set to `false` for an item that hosts its own interactive controls (e.g. a stepper) — selecting it then leaves the menu open instead of closing it. Defaults to `true`, matching Radix's own default. */
  closeOnSelect?: boolean
}

function Item({
  asChild,
  onSelect,
  onClick,
  closeOnSelect = true,
  ...props
}: MenuItemProps) {
  const { isDesktop, onOpenChange } = useMenuContext('Item')

  if (isDesktop) {
    return (
      <DropdownMenu.Item
        asChild={asChild}
        onSelect={(event) => {
          if (!closeOnSelect) event.preventDefault()
          onSelect?.(event)
        }}
        {...props}
      />
    )
  }

  // Dialog has no built-in "item" concept, so we mimic DropdownMenu.Item's
  // default "select closes the menu" behaviour by closing after whatever
  // handler the item itself carries (including asChild-wrapped <a href>
  // links, which must still be allowed to navigate).
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      role='menuitem'
      onClick={(event: React.MouseEvent) => {
        onClick?.(event as React.MouseEvent<HTMLDivElement>)
        onSelect?.(event.nativeEvent)
        if (closeOnSelect) onOpenChange(false)
      }}
      {...props}
    />
  )
}

export const Menu = { Root, Trigger, Content, Item }
