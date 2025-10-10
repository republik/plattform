import Script from 'next/script'
import { useRef } from 'react'

interface StoryComponentProps {
  tagname?: string
  componentData?: Record<string, any>
}

function StoryComponent({ tagname, componentData }: StoryComponentProps) {
  const ref = useRef<HTMLElement>(null)

  if (!tagname) return <p>Tag name missing</p>

  // TODO: onError
  // TODO: custom props

  const src = `https://story.preview.republik.love/story-components/${tagname}/dist/index.js`
  // const src = 'http://localhost:5173/dist/index.js' // dev purposes
  const CustomElement = tagname as any

  return (
    <>
      <CustomElement
        ref={ref}
        key={tagname}
        data={JSON.stringify(componentData)}
      />
      <Script type='module' src={src} strategy='lazyOnload' />
    </>
  )
}

export default StoryComponent
