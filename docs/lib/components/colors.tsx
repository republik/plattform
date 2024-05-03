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

const legacyColorTokens = [
  'logo',
  'default',
  'overlay',
  'hover',
  'alert',
  'error',
  'defaultInverted',
  'overlayInverted',
  'divider',
  'dividerInverted',
  'primary',
  'primaryHover',
  'primaryText',
  'text',
  'textInverted',
  'textSoft',
  'textSoftInverted',
  'disabled',
  'accentColorBriefing',
  'accentColorInteraction',
  'accentColorOppinion',
  'accentColorFormats',
  'accentColorMeta',
  'accentColorAudio',
  'accentColorFlyer',
  'overlayShadow',
  'fadeOutGradientDefault',
  'fadeOutGradientDefault90',
  'fadeOutGradientOverlay',
  'displayLight',
  'displayDark',
  'sequential100',
  'sequential95',
  'sequential90',
  'sequential85',
  'sequential80',
  'sequential75',
  'sequential70',
  'sequential65',
  'sequential60',
  'sequential55',
  'sequential50',
  'opposite100',
  'opposite80',
  'opposite60',
  'neutral',
  'discrete1',
  'discrete2',
  'discrete3',
  'discrete4',
  'discrete5',
  'discrete6',
  'discrete7',
  'discrete8',
  'discrete9',
  'discrete10',
  'chartsInverted',
  'flyerBg',
  'flyerText',
  'flyerMetaText',
  'flyerFormatText',
]

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
                  ? token.var(`colors.${name}`)
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
