export default function VimeoTestPage() {
  return (
    <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
      <iframe
        src='https://player.vimeo.com/video/506000559?badge=0&autopause=0&player_id=0&app_id=58479'
        allow='autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share'
        referrerPolicy='strict-origin-when-cross-origin'
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title='NZZ Article Score Dashboard'
      />
    </div>
  )
}
