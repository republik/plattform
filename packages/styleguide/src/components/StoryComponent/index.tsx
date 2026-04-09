import Script from 'next/script'
import { useEffect, useState } from 'react'
import { Figure, FigureSize } from '../Figure'
import Spinner from '../Spinner'

interface StoryComponentProps {
  url?: string
  tagname?: string
  componentData?: Record<string, any>
  size: FigureSize
}

function StoryComponent({
  url,
  tagname,
  componentData,
  size,
}: StoryComponentProps) {
  const [isReady, setIsReady] = useState(false)
  // const url = 'http://localhost:5173/dist/index.js?v=2' // for local testing

  // we need the use effect otherwise components without shadow dom render the loader even after the content has loaded
  useEffect(() => {
    if (tagname) {
      customElements.whenDefined(tagname).then(() => {
        setIsReady(true)
      })
    }
  }, [tagname])

  if (!url) return <p>Component URL missing</p>
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

  const CustomComponent = tagname as any

  return (
    <>
      <Figure size={size}>
        <CustomComponent componentdata={JSON.stringify(componentData)} />
        <Script type='module' src={url} strategy='lazyOnload' />
      </Figure>
      {!isReady && Loader}
    </>
  )
}

export default StoryComponent
