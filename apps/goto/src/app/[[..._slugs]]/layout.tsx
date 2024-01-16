import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <main className='min-h-[100dvh] container mx-auto p-4 flex flex-col'>
      {children}
    </main>
  )
}
