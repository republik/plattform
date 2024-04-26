import { css } from '@republik/theme/css'
import { hstack } from '@republik/theme/patterns'
import { token } from '@republik/theme/tokens'

const colorTokens = [
  'text',
  'text.inverted',
  'text.white',
  'contrast',
  'background',
  'pageBackground',
  'link',
  'primary',
  'primaryHover',
  'overlay',
  'error',
  'divider',
  'disabled',
  'textSoft',
]

export function Colors() {
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
      {colorTokens.map((name) => {
        // const value = colors.base?.value

        // const tokenValue = context.tokens.deepResolveReference(value)

        return (
          <li key={name}>
            <Color name={name} />
          </li>
        )
      })}
    </ul>
  )
}

const Color = ({ name }: { name: string }) => {
  return (
    <div className={hstack()}>
      <div
        className={css({
          w: '[30px]',
          h: '[30px]',
          // borderColor: 'contrast',
          borderWidth: 1,
        })}
        style={{ background: token.var(`colors.${name}`) }}
      ></div>
      <div>
        <div>{name}</div>
        <div className={css({ fontSize: 'xs', color: 'textSoft' })}>
          {token.var(`colors.${name}`)}
        </div>
      </div>
    </div>
  )
}
