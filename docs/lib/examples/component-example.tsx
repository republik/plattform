import styles from './component-example.module.css'

/**
 * An example component
 */
export const ComponentExample = ({
  text,
  size = 'large',
}: {
  /** The text that's being displayed */
  text: string
  /** Size of the component */
  size?: 'small' | 'large' | 'extralarge'
}) => (
  <div
    className={styles.example}
    style={{
      fontSize:
        size === 'small' ? '0.75em' : size === 'large' ? '1em' : '1.5em',
    }}
  >
    {text}
  </div>
)
