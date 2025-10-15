import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

interface StoryComponentProps {
  tagname?: string
  componentData?: Record<string, any>
}

function StoryComponent({ tagname, componentData }: StoryComponentProps) {
  const ref = useRef<HTMLElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [componentReady, setComponentReady] = useState(false)

  useEffect(() => {
    if (scriptLoaded) {
      const checkRegistration = () => {
        if (customElements.get(tagname)) {
          setComponentReady(true)
        } else {
          setTimeout(checkRegistration, 50)
        }
      }
      checkRegistration()
    }
  }, [scriptLoaded, tagname])

  useEffect(() => {
    if (componentReady && ref.current && componentData) {
      const target = ref.current as any
      target.data = componentData
    }
  }, [componentReady, componentData])

  if (!tagname) return <p>Tag name missing</p>

  const src = `https://story.preview.republik.love/story-components/${tagname}/dist/index.js`
  // const src = 'http://localhost:5173/dist/index.js' // use locally running build
  const CustomElement = tagname as any

  return (
    <>
      <style>{`${tagname}:not(:defined) {
        opacity: 0;
      }`}</style>
      <CustomElement
        ref={ref}
        key={tagname}
        data={JSON.stringify(componentData)}
      />
      <Script
        type='module'
        src={src}
        strategy='lazyOnload'
        onLoad={() => setScriptLoaded(true)}
      />
    </>
  )
}

export default StoryComponent
