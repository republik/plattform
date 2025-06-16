'use client'
import { ReactNode, useDeferredValue, useState } from 'react'
import styles from './icon-explorer.module.css'

export const IconExplorer = ({
  icons,
}: {
  icons: { title: string; icon: ReactNode }[]
}) => {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const items = icons.filter(({ title }, i) =>
    `${title}${i}`.match(new RegExp(deferredSearch, 'i')),
  )

  return (
    <div className={styles.explorer}>
      <input
        className='nx-block nx-w-full nx-appearance-none nx-rounded-lg nx-px-3 nx-py-2 nx-transition-colors nx-text-base nx-leading-tight md:nx-text-sm nx-bg-black/[.05] dark:nx-bg-gray-50/10 focus:nx-bg-white dark:focus:nx-bg-dark placeholder:nx-text-gray-500 dark:placeholder:nx-text-gray-400 contrast-more:nx-border contrast-more:nx-border-current'
        placeholder='Search icon …'
        value={deferredSearch}
        onChange={(e) => setSearch(e.currentTarget.value)}
        onKeyUp={(e) => {
          if (e.key === 'Escape') {
            setSearch('')
            e.currentTarget.blur()
          }
        }}
      ></input>
      <ul className={styles.grid}>
        {items.map(({ title, icon }, i) => {
          return (
            <li key={title + i} className={styles.icon}>
              <div className={styles.iconTitle}>{title}</div>
              <div className={styles.iconWrapper}>{icon}</div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
