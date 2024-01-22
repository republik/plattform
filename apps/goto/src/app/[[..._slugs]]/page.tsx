import Goto from '../goto'

export default function Page() {
  return (
    <main className='min-h-[100dvh] container mx-auto p-4 flex flex-col'>
      <div className='flex-grow flex flex-col justify-center items-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='logo'>
            <svg className='w-8 h-8 mb-4' viewBox='0 0 127.264 127.264'>
              <path d='M115.667 115.595L95.393 72.228c-15.316.61-28.904-2.242-28.904-2.242V67.81c24.692-4.344 47.487-12.462 47.487-34.28C113.977 5.92 88.8.136 59.822.007L59.816 0H0v4.7l11.6 6.24 2.26 4.6v95.456l-2.26 4.6L0 121.832v4.702h62.816v-4.702l-11.598-6.238-2.44-4.6V80.77l10.07-8.575 22.035 54.34h46.38v-4.702l-11.596-6.238zM62.3 7.325c8.183 1.527 14.355 8.964 14.355 27.578 0 21.176-8.317 27.912-21.95 27.912h-5.928V17.07L62.3 7.325z'></path>
            </svg>
          </div>
          <div className='dots flex mb-2'>
            <div className='animate-bubble-1 w-2 h-2 mr-1 bg-black rounded-full'></div>
            <div className='animate-bubble-2 w-2 h-2 mr-1 bg-black rounded-full'></div>
            <div className='animate-bubble-3 w-2 h-2 bg-black rounded-full'></div>
          </div>
          <div className='children'>
            <Goto />
          </div>
        </div>
      </div>
    </main>
  )
}
