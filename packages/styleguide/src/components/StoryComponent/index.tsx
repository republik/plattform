import Script from 'next/script'
import { useCallback, useEffect, useRef, useState } from 'react'

interface StoryComponentProps {
  name: string
  attributes?: Record<string, string>
}

function StoryComponent({ name, attributes = {} }: StoryComponentProps) {
  const src = `https://story.preview.republik.love/story-components/${name}/dist/index.js`
  const ref = useRef<HTMLElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [componentReady, setComponentReady] = useState(false)

  // Wait for both script load and custom element registration
  const checkComponentReady = useCallback(() => {
    if (scriptLoaded && customElements.get(name)) {
      console.log(`Component ${name} is ready`)
      setComponentReady(true)
    }
  }, [scriptLoaded, name])

  useEffect(() => {
    checkComponentReady()
  }, [checkComponentReady])

  const handleScriptLoad = () => {
    setScriptLoaded(true)
    console.log(`Script for ${name} loaded`)
    // Some components register immediately, others need time
    setTimeout(checkComponentReady, 100)
  }

  const handleScriptError = () => {
    const error = new Error(`Failed to load script: ${src}`)
  }

  const Element = name as any

  return (
    <>
      <Element ref={ref} {...attributes} />
      <Script
        type='module'
        src={src}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy='afterInteractive'
      />
    </>
  )
}

export default StoryComponent
