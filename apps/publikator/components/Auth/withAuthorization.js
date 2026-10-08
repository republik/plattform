import { BrandMark } from '@project-r/styleguide'
import { css } from 'glamor'
import { useEffect } from 'react'
import withMe from '../../lib/withMe'
import withT from '../../lib/withT'
import Me from './Me'

const STUDIO_URL = 'https://republik.sanity.studio'

const styles = {
  center: css({
    width: '100%',
    maxWidth: '540px',
    margin: '20vh auto',
    padding: 20,
  }),
  brandMark: css({
    maxWidth: 40,
    marginBottom: 20,
  }),
}

const isAdmin = (me) => !!me?.roles?.includes('admin')

// Signed-in users without the admin role are sent to the Sanity Studio
function RedirectToStudio() {
  useEffect(() => {
    window.location.replace(STUDIO_URL)
  }, [])
  return null
}

const withAuthorization = (Component) =>
  withT(
    withMe((props) => {
      const { me } = props
      // me is undefined while the query is loading, null when signed out
      if (me === undefined) {
        return null
      }
      if (isAdmin(me)) {
        return <Component {...props} />
      }
      if (me) {
        return <RedirectToStudio />
      }
      return (
        <div {...styles.center}>
          <div {...styles.brandMark}>
            <BrandMark />
          </div>
          <Me />
        </div>
      )
    }),
  )

export default withAuthorization
