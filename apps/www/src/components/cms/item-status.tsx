import { css } from '@app/styled-system/css'

export const CmsItemStatus = ({ status }: { status: string }) => {
  if (status === 'published') {
    return null
  }
  return (
    <span
      className={css({
        borderRadius: 'full',
        color: 'disabled',
        borderColor: 'disabled',
        borderWidth: 2,
        fontSize: '0.5em',
        px: '1.5',
        py: '0.5',
        display: 'inline-block',
      })}
    >
      {status.toLocaleUpperCase()}
    </span>
  )
}
