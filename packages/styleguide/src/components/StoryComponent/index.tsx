import Script from 'next/script'

interface StoryComponentProps {
  tagname?: string
  componentData?: Record<string, any>
}

function StoryComponent({ tagname, componentData }: StoryComponentProps) {
  if (!tagname) return <p>Tag name missing</p>

  // TODO: env variable for story server
  // const src = `https://story.preview.republik.love/story-components/${tagname}/dist/index.js`
  const src = 'http://localhost:5173/dist/index.js' // use locally running build

  const CustomCompponent = tagname as any

  // tried for several hours to set the componentdata props with javascript instead of via attribute, to no avail...

  return (
    <>
      <CustomCompponent componentdata={JSON.stringify(componentData)} />
      <Script type='module' src={src} strategy='lazyOnload' />
    </>
  )
}

export default StoryComponent
