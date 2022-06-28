import { withDefaultSSR } from '../../lib/apollo/helpers'
import ArticlePage from '../../components/Article/Page'

const PreviewArticlePage = (props) => <ArticlePage {...props} isPreview />

PreviewArticlePage.getInitialProps = () => {
  return {
    payNoteTryOrBuy: Math.random(),
    payNoteSeed: Math.random(),
  }
}

export default withDefaultSSR(PreviewArticlePage)
