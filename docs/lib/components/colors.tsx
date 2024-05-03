import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import { Token, token } from '@republik/theme/tokens'

export function Colors({
  tokens,
  tokenType = 'pandacss',
}: {
  tokens: string[]
  tokenType: 'legacy' | 'pandacss'
}) {
  return (
    <ul
      className={css({
        display: 'flex',
        flexDir: 'column',
        gap: '4',
        bg: 'pageBackground',
        p: '4',
        color: 'text',
      })}
    >
      {tokens.map((name) => {
        return (
          <li key={name}>
            <Color
              name={name}
              value={
                tokenType === 'pandacss'
                  ? token.var(`colors.${name}` as Token)
                  : `var(--color-${name})`
              }
            />
          </li>
        )
      })}
    </ul>
  )
}

const Color = ({ name, value }: { name: string; value: string }) => {
  return (
    <div className={hstack()}>
      <div
        className={css({
          w: '[30px]',
          h: '[30px]',
          // borderColor: 'contrast',
          borderWidth: 1,
        })}
        style={{ background: value }}
      ></div>
      <div>
        <div>{name}</div>
        <div className={css({ fontSize: 'xs', color: 'textSoft' })}>
          {value}
        </div>
      </div>
    </div>
  )
}
