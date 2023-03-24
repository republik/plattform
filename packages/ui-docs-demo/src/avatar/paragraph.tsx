import { ReactNode } from 'react'

type Propz = { children: ReactNode }

/** Hello Paragraph */
export const Paragraph = ({ children }: Propz) => {
  return <p>{children}</p>
}
