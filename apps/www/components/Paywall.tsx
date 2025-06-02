import React from 'react'

export default function Paywall({ onSubscribe }: { onSubscribe: () => void }) {
  return (
    <div className='paywall'>
      <p>
        You have reached your free article limit. Subscribe for unlimited
        access!
      </p>
      <button onClick={onSubscribe}>Subscribe Now</button>
    </div>
  )
}
