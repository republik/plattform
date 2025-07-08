export interface DerivativeRow {
  id: string
  commitId?: string
  type: 'SyntheticReadAloud'
  status: 'Pending' | 'Ready' | 'Failure' | 'Destroyed'
  result?: any
  userId?: string
  author: DerivativeAuthor
  createdAt: Date
  updatedAt: Date
  readyAt?: Date
  failedAt?: Date
  destroyedAt?: Date
}

interface DerivativeAuthor {
  name: string
  email: string
}

export interface Commit {
  id: string
  repoId: string
  parentIds: string[]
  message: string
  type: null | 'mdast'
  content: string
  content__markdown: string
  meta: any
  userId?: string
  author: CommitAuthor
  createdAt: Date
}

interface CommitAuthor {
  name: string
  email: string
}
