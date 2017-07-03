export interface User {
  id: string
  name: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  updatedAt: string
}

export interface UsersResult {
  users: {
    items: User[]
    meta: { count: number }
  }
}

export interface UserParams {
  orderBy?: string
}
