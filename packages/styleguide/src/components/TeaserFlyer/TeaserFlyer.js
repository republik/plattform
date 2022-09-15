import React from 'react'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { TeaserSectionTitle } from '../TeaserShared'
import SlateRender from '../Editor/Render'
import schema from '../Editor/schema/flyer'
import { RenderContextProvider } from '../Editor/Render/Context'
import { plainLinkRule } from '../Typography'
import { FLYER_CONTAINER_MAXWIDTH } from '../Flyer'

const DefaultLink = ({ children }) => children

const styles = {
  outerContainer: css({
    padding: '46px 0',
    [mUp]: {
      padding: '70px 0',
    },
  }),
  innerContainer: css({
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: FLYER_CONTAINER_MAXWIDTH,
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '0 15px',
    [mUp]: {
      padding: 0,
    },
  }),
  link: css({
    marginTop: 27,
    [mUp]: {
      marginTop: 36,
    },
  }),
}

const FLYER_LINKTEXT = 'Lesen Sie das Republik-Journal'

const TeaserFlyer = ({ flyer, Link = DefaultLink }) => {
  const value = flyer.content.children[0].children.filter(
    (n) => ['headline', 'flyerOpeningP'].indexOf(n.type) !== -1,
  )

  return (
    <div {...styles.outerContainer}>
      <div {...styles.innerContainer}>
        <Link href={flyer.meta.path} passHref>
          <a {...plainLinkRule} href={flyer.meta.path}>
            <RenderContextProvider>
              <SlateRender value={value} schema={schema} raw />
            </RenderContextProvider>
            <div {...styles.link}>
              <TeaserSectionTitle small clickable>
                {FLYER_LINKTEXT}
              </TeaserSectionTitle>
            </div>
          </a>
        </Link>
      </div>
    </div>
  )
}

const WrappedTeaserFlyer = (props) => <TeaserFlyer {...props} />

export default WrappedTeaserFlyer

WrappedTeaserFlyer.data = {
  config: {
    props: ({ data }) => {
      return {
        data: {
          loading: data.loading,
          error: data.error,
          flyer: data.latestFlyer?.nodes[0],
        },
      }
    },
  },
  query: `
    query getLatestFlyer {
      latestFlyer: documents(format: "republik/format-journal", first: 1) {
        nodes {
          id
          meta {
            title
            path
            format {
              meta {
                title
              }
            }
          }
          content
        }
      }
    }
  `,
}
