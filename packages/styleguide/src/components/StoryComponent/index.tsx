import Script from 'next/script'
import { useRef } from 'react'

interface StoryComponentProps {
  tagname?: string
}

function StoryComponent({ tagname }: StoryComponentProps) {
  const ref = useRef<HTMLElement>(null)
  
  if (!tagname) return <p>Tag name missing</p>

  const src = `https://story.preview.republik.love/story-components/${tagname}/dist/index.js`
  const CustomElement = tagname as any

  return (
    <>
      <CustomElement ref={ref} />
      <Script type='module' src={src} strategy='lazyOnload' />
    </>
  )
}

export default StoryComponent
