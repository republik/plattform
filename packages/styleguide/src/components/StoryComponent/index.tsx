import Script from 'next/script'
import React, { useEffect, useRef, useState } from 'react'

interface StoryComponentProps {
  tagname?: string
  componentData?: Record<string, any>
}

function StoryComponent({ tagname, componentData }: StoryComponentProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [componentReady, setComponentReady] = useState(false)

  useEffect(() => {
    if (scriptLoaded && tagname) {
      customElements.whenDefined(tagname).then(() => {
        setComponentReady(true)
      })
    }
  }, [scriptLoaded, tagname])

  useEffect(() => {
    if (componentReady && ref.current && componentData) {
      console.log(window)
      // Clear any existing elements first
      ref.current.innerHTML = ''

      const element = document.createElement(tagname) as any
      element.componentData = componentData

      // console.log('Component data set:', componentData)
      ref.current.appendChild(element)
      console.log('Element appended to container')
      console.log('Container children:', ref.current.children)

      // Check if element is actually in DOM
      setTimeout(() => {
        console.log(
          'After timeout - Container children:',
          ref.current?.children,
        )
        console.log('Element defined?', customElements.get(tagname))
      }, 100)
    }
  }, [componentReady, componentData, tagname])

  if (!tagname) return <p>Tag name missing</p>

  // TODO: env variable for story server
  // const src = `https://story.preview.republik.love/story-components/${tagname}/dist/index.js`
  const src = 'http://localhost:5173/dist/index.js' // use locally running build

  return (
    <>
      <div
        ref={ref}
        style={{ minHeight: '50px', border: '1px solid red' }}
      ></div>
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
