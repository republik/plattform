'use client'
import { css } from '@app/styled-system/css'
import { useRouter } from 'next/navigation'

export default function Overlay(props: { children: React.ReactNode }) {
  const router = useRouter()

  return (
    <div
      className={css({
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100dvh',
        zIndex: 10,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bg: 'rgba(0,0,0,0.5)',
      })}
      onClick={() => router.back()}
    >
      <div
        className={css({
          padding: 4,
          backgroundColor: 'challengeAccepted.yellow',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        })}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={css({
            justifySelf: 'flex-start',
          })}
        >
          <button onClick={() => router.back()}>X</button>
        </div>
        {props.children}
      </div>
    </div>
  )
}
