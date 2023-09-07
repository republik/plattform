import '@testing-library/jest-dom/extend-expect'
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

if (typeof window !== 'undefined' && !window.__NEXT_DATA__) {
  window.__NEXT_DATA__ = { env: {} }
}

import { loadEnvConfig } from '@next/env'

export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
