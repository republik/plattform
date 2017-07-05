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
    count: number
  }
}

export interface UserResult {
  user: User
}

export interface UserTableParams {
  orderBy?: string
  search?: string
}

export interface UserParams {
  userId: string
}
