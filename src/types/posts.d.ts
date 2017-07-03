export interface Post {
  id: string
  title: string
  url: string
  post: string
  votes: number
}

export interface AllPostsResult {
  allPosts: Post[]
  _allPostsMeta: { count: number }
}

export interface CreatePostResult {
  createPost: Post
}
