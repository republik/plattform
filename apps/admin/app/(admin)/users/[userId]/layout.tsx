import App from '@/components/App'
import ProfileHeader from '@/components/Users/ProfileHeader'
import { Body, Content } from '@/components/Layout'
import Header from '@/components/Layout/Header'
import { UserMenu } from './user-menu'

export default async function UserLayout({ children, params }) {
  const { userId } = await params
  return (
    <App>
      <Body>
        <Header />
        <Content id='content'>
          <ProfileHeader userId={userId} section={'index'} />
          <UserMenu userId={userId} />
          {children}
        </Content>
      </Body>
    </App>
  )
}
