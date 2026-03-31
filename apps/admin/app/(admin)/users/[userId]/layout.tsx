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

          background: 'hover',

          // borderRightColor: 'divider',
          // borderRightStyle: 'solid',
          // borderRightWidth: '1px',
        })}
      >
        <UserMenu userId={userId} />
      </div>
      <div
        className={css({
          gridArea: 'content',

          position: 'relative',
          overflowY: 'auto',
          p: '4',

          display: 'grid',
          gridTemplateColumns: '[repeat(auto-fill, minmax(400px, 1fr))]',
          gridAutoRows: 'max',
          gap: '8',
        })}
      >
        {children}
      </div>
    </div>
  )
}
