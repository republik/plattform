import React from 'react'
import App from '../components/App'
import {
  Body,
  Content,
  Header,
  Footer
} from '../components/Layout'

const Layout = () => {
  return (
    <App>
      <Body>
        <Header />
        <Content>foobar</Content>
        <Footer>
          <h3>Column</h3>
        </Footer>
      </Body>
    </App>
  )
};

export default Layout;
