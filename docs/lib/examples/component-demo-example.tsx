import { ComponentExample } from './component-example'

/**
 * Example Component Demo
 */
export default function Demo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ComponentExample text='Small size' size='small' />
      <ComponentExample text='Large size (default)' />
      <ComponentExample text='Extra large size' size='extralarge' />
    </div>
  )
}
