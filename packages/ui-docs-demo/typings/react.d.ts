import 'react'

// Allow CSS custom properties in style props, e.g. <div style={{"--bg-color": "hotpink"}} />
declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number
  }
}
