import { ReactNode } from 'react'

export function InterviewQuestion({ children }: { children?: ReactNode }) {
  return <p className='interview-question'>{children}</p>
}
