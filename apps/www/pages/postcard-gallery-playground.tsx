// import PostcardGallery from '../components/Climatelab/Postcard/Gallery/PostcardGallery'

import { useState } from 'react'
import {
  usePostcardsData,
  useSinglePostcardData,
} from '../components/Climatelab/Postcard/use-postcard-data'

const DUMMY_HIGHLIGHTED = [
  {
    id: '8178e062-0569-47f6-a136-625f07e63678',
    text: 'This is the new text!',
  },
  {
    id: '67177a2c-04df-4e70-8fd7-f1e5dc4116f9',
    text: 'This is the new text again!',
  },
]

const DebugGallery = () => {
  const [subjectFilter, setSubjectFilter] = useState<undefined | string>()

  const postcardsData = usePostcardsData({
    highlightedPostcards: DUMMY_HIGHLIGHTED,
    subjectFilter: subjectFilter as any,
  })

  const singlePostcardData = useSinglePostcardData({
    highlightedPostcards: DUMMY_HIGHLIGHTED,
    subjectFilter: subjectFilter as any,
  })

  return postcardsData._state === 'LOADED' ? (
    <>
      <h1>
        Postcards (showing {postcardsData.postcards.length} of{' '}
        {postcardsData.totalCount})
      </h1>

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

      <h2>Current Postcard</h2>

      {singlePostcardData._state === 'LOADED' && singlePostcardData.postcard ? (
        <div>
          <pre>{JSON.stringify(singlePostcardData.postcard, null, 2)}</pre>

          <button
            onClick={() => {
              singlePostcardData.fetchNext()
            }}
          >
            Next Postcard
          </button>
        </div>
      ) : null}

      <h2>Ordered Postcards</h2>

      {postcardsData.postcards.map((p) => {
        return (
          <div key={p.id}>
            <pre>{JSON.stringify(p, null, 2)}</pre>
          </div>
        )
      })}

      <button
        onClick={() => {
          postcardsData.fetchMore()
        }}
      >
        Load more
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
