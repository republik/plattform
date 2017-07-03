import * as React from 'react'
import { FormEvent } from 'react'
import { gql, graphql, OptionProps } from 'react-apollo'
import { AllPostsResult, CreatePostResult } from '../types/posts'

interface DOMForm extends HTMLFormElement {
  elements: HTMLFormControlsCollection & {
    [key: string]: HTMLInputElement
  }
}

interface OwnProps {
  [prop: string]: any
  createPost?: (title: string, url: string) => Promise<any>
}

const Submit = ({ createPost }: OwnProps) => {
  const handleSubmit = (e: FormEvent<DOMForm>) => {
    e.preventDefault()
    const form = e.target as DOMForm

    const title = form.elements.title.value
    let url = form.elements.url.value

    if (title === '' || url === '') {
      window.alert('Both fields are required.')
      return false
    }

    // prepend http if missing from url
    if (!url.match(/^[a-zA-Z]+:\/\//)) {
      url = `http://${url}`
    }

    if (!createPost) {
      throw new Error('createPost is undefined')
    }
    createPost(title, url)

    // reset form
    form.elements.title.value = ''
    form.elements.url.value = ''
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Submit</h1>
      <input placeholder="title" name="title" />
      <input placeholder="url" name="url" />
      <button type="submit">Submit</button>
      <style>{`
        form {
          border-bottom: 1px solid #ececec;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }
        h1 {
          font-size: 20px;
        }
        input {
          display: block;
          margin-bottom: 10px;
        }
      `}</style>
    </form>
  )
}

const createPost = gql`
  mutation createPost($title: String!, $url: String!) {
    createPost(title: $title, url: $url) {
      id
      title
      votes
      url
      createdAt
    }
  }
`

export default graphql(createPost, {
  props: ({ mutate }: OptionProps<OwnProps, CreatePostResult>) => ({
    createPost: (title: string, url: string) => {
      if (!mutate) {
        throw new Error('mutate not defined')
      }
      return mutate({
        variables: { title, url },
        updateQueries: {
          allPosts: (
            previousResult: AllPostsResult,
            { mutationResult: { data } }: any
          ) => {
            const newPost = (data as CreatePostResult).createPost
            return {
              ...previousResult,
              ...{
                allPosts: [newPost, ...previousResult.allPosts]
              }
            }
          }
        }
      })
    }
  })
})(Submit)
