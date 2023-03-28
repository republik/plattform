import styles from './avatar.module.css'

type Flavor = 'strawberry' | 'banana' | 'chocolate'

/**
 * Avatar hey whassup
 */
export const Avatar = ({
  src,
  alt = 'Alternative teggscht',
  fallback,
  color,
}: {
  /** Image source */
  src?: string
  /** Alternative text for the photo */
  alt?: string
  /** Fallback string to be shown when the image fails to load */
  fallback?: string
  /** The color of the Avatar */
  color?: string
  /** This is a named union  */
  flavor?: Flavor
  /** This is an inline union  */
  kind?: 'a' | 'b' | 'c'
}) => (
  <span className={styles.avatar} style={{ backgroundColor: color }}>
    {src && <img src={src} alt={alt}></img>}
    {fallback && <span className={styles.fallback}>{fallback}</span>}
  </span>
)
