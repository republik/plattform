// import PostcardGallery from '../components/Climatelab/Postcard/Gallery/PostcardGallery'

import { useState } from 'react'
import { usePostcardsData } from '../components/Climatelab/Postcard/use-postcard-data'

const DUMMY_HIGHLIGHTED = [
  {
    id: '8178e062-0569-47f6-a136-625f07e63678',
    text: 'This is the new text!',
  },
]

const DebugGallery = () => {
  const [subjectFilter, setSubjectFilter] = useState()

  const postcardsData = usePostcardsData({
    highlightedPostcards: DUMMY_HIGHLIGHTED,
    subjectFilter: subjectFilter,
  })

  return postcardsData._state === 'LOADED' ? (
    <>
      <h1>Postcards ({postcardsData.postcards.length})</h1>

      <label>
        Filter{' '}
        <select
          value={subjectFilter ?? 'NONE'}
          onChange={(e) =>
            setSubjectFilter(
              e.currentTarget.value === 'NONE'
                ? undefined
                : e.currentTarget.value,
            )
          }
        >
          <option value='NONE'>NONE</option>
          <option value='postcard_1'>Card 1</option>
          <option value='postcard_2'>Card 2</option>
          <option value='postcard_3'>Card 3</option>
          <option value='postcard_4'>Card 4</option>
        </select>
      </label>

      {postcardsData.postcards.map((p) => {
        return (
          <div key={p.id}>
            <pre>{JSON.stringify(p, null, 2)}</pre>
          </div>
        )
      })}

      <button
        onClick={() => {
          postcardsData.fetchMoreHighlighted()
        }}
      >
        Load more highlighted
      </button>
      <button
        onClick={() => {
          postcardsData.fetchMoreNotHighlighted()
        }}
      >
        Load more normalo
      </button>
    </>
  ) : (
    <div>Loading or whatever</div>
  )
}

function Page() {
  return <DebugGallery />
}
export default Page
