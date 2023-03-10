import styles from './avatar.module.css'

export const Avatar = ({
  src,
  alt,
  fallback,
  color,
}: {
  src?: string
  alt?: string
  fallback?: string
  color?: string
}) => (
  <span className={styles.avatar} style={{ backgroundColor: color }}>
    {src && <img src={src} alt={alt}></img>}
    {fallback && <span className={styles.fallback}>{fallback}</span>}
  </span>
)
