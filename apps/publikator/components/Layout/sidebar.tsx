import { css } from 'glamor'
import Image from 'next/image'
import { IconButton, Popover } from '@radix-ui/themes'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  FileTextIcon,
  PersonIcon,
  CalendarIcon,
  FileIcon,
} from '@radix-ui/react-icons'
import SignOut from '../Auth/SignOut'

const mobilePortrait = '@media only screen and (max-width: 480px)'

const styles = {
  sidebar: css({
    backgroundColor: '#fff',
    borderRight: '1px solid #e5e5e5',
    transition: 'width 0.3s ease',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 900,
    [mobilePortrait]: {
      transform: 'translateX(-100%)',
    },
  }),
  sidebarOpen: css({
    width: 180,
    [mobilePortrait]: {
      transform: 'translateX(0)',
    },
  }),
  sidebarCollapsed: css({
    width: 60,
    '& .menuLabel': {
      display: 'none',
    },
    '& .userName': {
      display: 'none',
    },
    '& .logoText': {
      display: 'none',
    },
  }),
  logo: css({
    height: 60,
    padding: '0 20px',
    borderBottom: '1px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'inherit',
  }),
  logoImage: css({
    width: 24,
    height: 24,
  }),
  menu: css({
    padding: '20px 0',
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#fff',
    '&::-webkit-scrollbar': {
      width: '4px',
      backgroundColor: '#fff',
    },
    '&::-webkit-scrollbar-track': {
      background: '#f1f1f1',
      borderRadius: '2px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: '#888',
      borderRadius: '2px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: '#555',
    },
  }),
  menuItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 20px',
    textDecoration: 'none',
    color: '#000',
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  }),
  menuItemActive: css({
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
  }),
  menuToggle: css({
    position: 'absolute',
    right: -20,
    top: 20,
    zIndex: 101,
    backgroundColor: '#fff',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    [mobilePortrait]: {
      display: 'none',
    },
  }),
  userProfile: css({
    padding: '16px',
    borderTop: '1px solid #e5e5e5',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    backgroundColor: '#fff',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
    [mobilePortrait]: {
      justifyContent: 'center',
    },
  }),
  userImage: css({
    width: 32,
    height: 32,
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
  }),
  popoverContent: css({
    padding: '16px',
    minWidth: '200px',
  }),
  mobileMenuToggle: css({
    display: 'none',
    [mobilePortrait]: {
      display: 'block',
      position: 'fixed',
      bottom: 10,
      left: 10,
      zIndex: 1000,
      backgroundColor: '#fff',
      borderRadius: '50%',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: 4,
    },
  }),
  overlay: css({
    display: 'none',
    [mobilePortrait]: {
      display: 'block',
      position: 'fixed',
      top: 60,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 99,
      opacity: 0,
      visibility: 'hidden',
      transition: 'opacity 0.3s ease, visibility 0.3s ease',
    },
  }),
  overlayVisible: css({
    [mobilePortrait]: {
      opacity: 1,
      visibility: 'visible',
    },
  }),
}

type SidebarProps = {
  isSidebarOpen: boolean
  setIsSidebarOpen: (isOpen: boolean) => void
  me: any
}

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, me }: SidebarProps) {
  const router = useRouter()
  const isActive = (path) => router.pathname === path

  return (
    <>
      <div
        {...styles.overlay}
        {...(isSidebarOpen && styles.overlayVisible)}
        onClick={() => setIsSidebarOpen(false)}
      />
      <div {...styles.mobileMenuToggle}>
        <IconButton
          variant='ghost'
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {!isSidebarOpen ? (
            <ChevronRightIcon width={24} height={24} />
          ) : (
            <ChevronLeftIcon width={24} height={24} />
          )}
        </IconButton>
      </div>

      <aside
        {...styles.sidebar}
        {...(isSidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed)}
      >
        <a href='/' {...styles.logo}>
          <Image
            src='/publikator-logo.svg'
            alt='Publikator Logo'
            width={24}
            height={24}
            {...styles.logoImage}
          />
          <h3 className="logoText">Publikator</h3>
        </a>

        <nav {...styles.menu}>
          <Link
            href='/'
            {...styles.menuItem}
            className="menuItem"
            {...(isActive('/beitraege') && styles.menuItemActive)}
          >
            <FileTextIcon width={24} height={24} />
            <span className='menuLabel'>Beiträge</span>
          </Link>
          <Link
            href='/authors'
            {...styles.menuItem}
            className="menuItem"
            {...(isActive('/authors') && styles.menuItemActive)}
          >
            <PersonIcon width={24} height={24} />
            <span className='menuLabel'>Author*innen</span>
          </Link>
          <Link
            href='/templates'
            {...styles.menuItem}
            className="menuItem"
            {...(isActive('/templates') && styles.menuItemActive)}
          >
            <FileIcon width={24} height={24} />
            <span className='menuLabel'>Templates</span>
          </Link>
          <Link
            href='/calendar'
            {...styles.menuItem}
            className="menuItem"
            {...(isActive('/calendar') && styles.menuItemActive)}
          >
            <CalendarIcon width={24} height={24} />
            <span className='menuLabel'>Kalender</span>
          </Link>
        </nav>

        {me && (
          <Popover.Root>
            <Popover.Trigger>
              <div {...styles.userProfile}>
                {me?.portrait && (
                  <div {...styles.userImage}>
                    <Image
                      src={me.portrait}
                      alt={me.name || me.email}
                      width={32}
                      height={32}
                    />
                  </div>
                )}
              </div>
            </Popover.Trigger>
            <Popover.Content {...styles.popoverContent}>
              <SignOut />
            </Popover.Content>
          </Popover.Root>
        )}

        <div {...styles.menuToggle}>
          <IconButton
            variant='ghost'
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <ChevronLeftIcon width={24} height={24} />
            ) : (
              <ChevronRightIcon width={24} height={24} />
            )}
          </IconButton>
        </div>
      </aside>
    </>
  )
} 