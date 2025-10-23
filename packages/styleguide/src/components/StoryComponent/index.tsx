import Script from 'next/script'
import { useEffect, useState } from 'react'
import { Figure, FigureSize } from '../Figure'
import Spinner from '../Spinner'

interface StoryComponentProps {
  url?: string
  componentData?: Record<string, any>
  size: FigureSize
}

function StoryComponent({ url, componentData, size }: StoryComponentProps) {
  const [isReady, setIsReady] = useState(false)

  // const url = `https://story.preview.republik.love/story-components/${tagname}/dist/index.js`
  const regex = /\S*\/story-components\/([\w\-]+)\/dist\/index\.js\S*/
  const tagname = url?.match(regex)[1]

  // const url = 'http://localhost:5173/dist/index.js' // for local testing
  // const tagname = 'the-big-question' // for local testing

  // TODO: live deployment for story server
  // TODO: pass the whole url as prop (query string for cache busting)
  const CustomCompponent = tagname as any

  useEffect(() => {
    if (tagname) {
      customElements.whenDefined(tagname).then(() => {
        setIsReady(true)
      })
    }
  }, [tagname])

  // FYI: tried for several hours to set the componentdata props with javascript instead of via attribute, to no avail...

  if (!tagname) return <p>Tag name missing</p>

  const Loader = (
    <div
      style={{
        minHeight: '150px',
        position: 'relative',
      }}
    >
      <Spinner />
    </div>
  )

  return (
    <Figure size={size}>
      {isReady ? (
        <CustomCompponent componentdata={JSON.stringify(componentData)} />
      ) : (
        Loader
      )}
      <Script type='module' src={url} strategy='lazyOnload' />
    </Figure>
  )
}

export default StoryComponent
