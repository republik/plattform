import Script from 'next/script'
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
  // const url = 'http://localhost:5173/dist/index.js' // for local testing

  const CustomCompponent = tagname as any

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

  return (
    <Figure size={size}>
      <CustomCompponent componentdata={JSON.stringify(componentData)}>
        {Loader}
      </CustomCompponent>
      <Script type='module' src={url} strategy='lazyOnload' />
    </Figure>
  )
}

export default StoryComponent
