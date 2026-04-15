import Frame from '../Frame'
import List from './List'

const Page = ({ serverContext }) => (
  <Frame raw>
    <List serverContext={serverContext} />
  </Frame>
)

export default Page
