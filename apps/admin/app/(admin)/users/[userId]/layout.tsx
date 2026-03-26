import { UserHeader } from '@/app/(admin)/users/[userId]/user-header'
import Header from '@/components/Layout/Header'
import { css } from '@republik/theme/css'
import { UserMenu } from './user-menu'

export default async function UserLayout({ children, params }) {
  const { userId } = await params
  return (
    <div
      className={css({
        display: 'grid',
        gridTemplateAreas: `
          "header header"
          "sidebar content"
        `,
        gridTemplateRows: '[auto 1fr]',
        gridTemplateColumns: '[200px 1fr]',
        height: '[100dvh]',
      })}
    >
      <div
        className={css({
          gridArea: 'header',

          borderColor: 'divider',
          borderBottom: '1px solid',
        })}
      >
        <Header />
        <UserHeader userId={userId} />
      </div>

      <div
        className={css({
          gridArea: 'sidebar',

          borderRightColor: 'divider',
          borderRightStyle: 'solid',
          borderRightWidth: '1px',
        })}
      >
        <UserMenu userId={userId} />
      </div>
      <div
        className={css({
          gridArea: 'content',

          position: 'relative',
          overflowY: 'auto',

          display: 'flex',
          flexDirection: 'column',
          gap: '8',
          maxWidth: 'center',
          width: 'full',
          mx: 'auto',
          p: '4',
        })}
      >
        {children}
      </div>
    </div>
  )
}
