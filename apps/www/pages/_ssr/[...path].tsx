import Article from '../../components/Article/Page'
import withDefaultSSR from '../../lib/hocs/withDefaultSSR'

/**
 * Reexport the article page with SSR-mode.
 */
export default withDefaultSSR((props) => <Article {...props} />)
