// public/client exposed env

export const REPUBLIK_FRONTEND_URL =
  process.env.NEXT_PUBLIC_REPUBLIK_FRONTEND_URL || 'https://www.republik.ch'

export const API_URL = process.env.NEXT_PUBLIC_API_URL
export const API_AUTHORIZATION_HEADER =
  process.env.NEXT_PUBLIC_API_AUTHORIZATION_HEADER

export const MAILBOX_SELF = process.env.NEXT_PUBLIC_MAILBOX_SELF
