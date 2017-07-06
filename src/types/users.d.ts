export interface Address {
  name?: string
  line1: string
  line2?: string
  postalCode: string
  city: string
  country: string
}

export interface User {
  id: string
  name: string
  email: string
  firstName: string
  lastName: string
  address?: Address
  birthDate?: string
  phoneNumber?: string
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
