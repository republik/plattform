import App from '@/components/App'
import { Body, Content } from '@/components/Layout'
import { Container } from '@project-r/styleguide'
import SignIn from 'components/Auth/SignIn'
export default function LoginPage() {
  return (
    <App>
      <Body>
        <Content id='content'>
          <Container>
            <SignIn />
          </Container>
        </Content>
      </Body>
    </App>
  )
}
