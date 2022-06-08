import Article from '../../components/Article/Page'
import { withDefaultSSR } from '../../lib/apollo/helpers'

/**
 * Reexport the article page with SSR-mode.
 */
export default withDefaultSSR((props) => <Article {...props} />)
