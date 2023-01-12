// import PostcardGallery from '../components/Climatelab/Postcard/Gallery/PostcardGallery'

import { usePostcardsData } from '../components/Climatelab/Postcard/use-postcard-data'

const DUMMY_HIGHLIGHTED = [
  {
    id: '8178e062-0569-47f6-a136-625f07e63678',
    text: 'This is the new text!',
  },
]

const DebugGallery = () => {
  const postcardsData = usePostcardsData({
    highlightedPostcards: DUMMY_HIGHLIGHTED,
  })

  console.log(postcardsData.postcards)

  return postcardsData._state === 'LOADED' ? (
    <>
      <h1>Postcards ({postcardsData.postcards.length})</h1>

      {postcardsData.postcards.map((p) => {
        return (
          <div key={p.id}>
            <pre>{JSON.stringify(p, null, 2)}</pre>
          </div>
        )
      })}
    </>
  ) : (
    <div>Loading or whatever</div>
  )
}

function Page() {
  return <DebugGallery />
}
export default Page
