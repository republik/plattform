import { css } from 'glamor'
import {
  mediaQueries,
  fontStyles,
  plainButtonRule,
  useColorContext,
} from '@project-r/styleguide'
import {
  HEADER_HEIGHT,
  HEADER_HORIZONTAL_PADDING,
} from '../constants'
import { useTranslation } from '../../lib/withT'
import { ME_PORTRAIT_STORAGE_KEY } from '../../lib/context/MeContext'
import { IconAccountBox } from '@republik/icons'

const BUTTON_SIZE = 32
const BUTTON_PADDING = (HEADER_HEIGHT - BUTTON_SIZE) / 2

export const SignInLink = () => {
  const [colorScheme] = useColorContext()
  const { t } = useTranslation()
  return (
    <div data-hide-if-me='true'>
      <span {...styles.anonymous}>
        <IconAccountBox {...colorScheme.set('fill', 'text')} />
      </span>
      <span
        {...styles.label}
        {...colorScheme.set('color', 'text')}
      >
        {t('header/signin')}
      </span>
    </div>
  )
}

export const getInitials = (me) =>
  (me.name && me.name.trim()
    ? me.name.split(' ').filter((n, i, all) => i === 0 || all.length - 1 === i)
    : me.email
        .split('@')[0]
        .split(/\.|-|_/)
        .slice(0, 2)
  )
    .slice(0, 2)
    .filter(Boolean)
    .map((s) => s[0])
    .join('')

const User = ({ me, title, backButton, onClick }) => {
  const [colorScheme] = useColorContext()
  return (
    <button {...styles.user} onClick={onClick} title={title}>
      <span
        {...styles.button}
        {...colorScheme.set('color', 'text')}
        style={{
          paddingLeft: backButton
            ? BUTTON_PADDING / 2
            : HEADER_HORIZONTAL_PADDING,
        }}
      >
        {!me && (
          <>
            <div data-show-if-me='true' {...styles.stack}>
              <span
                suppressHydrationWarning
                data-temporary-initials=''
                {...styles.portrait}
                {...styles.temporaryInitals}
                {...colorScheme.set('backgroundColor', 'hover')}
                {...colorScheme.set('color', 'text')}
              />
              <img
                suppressHydrationWarning
                data-temporary-portrait=''
                {...styles.portrait}
                {...styles.temporaryPortrait}
              />
            </div>
            <script
              dangerouslySetInnerHTML={{
                __html: [
                  'try{',
                  `var a=localStorage.getItem("${ME_PORTRAIT_STORAGE_KEY}");`,
                  'if(a.indexOf("/")!==-1){',
                  'document.querySelector("[data-temporary-portrait]").setAttribute("src",a)',
                  '}else if(a){',
                  'document.querySelector("[data-temporary-initials]").setAttribute("data-initials",a);',
                  '}',
                  '}catch(e){}',
                ].join(''),
              }}
            />
          </>
        )}
        {me &&
          (me.portrait ? (
            <img src={me.portrait} {...styles.portrait} />
          ) : (
            <span
              {...styles.portrait}
              {...colorScheme.set('backgroundColor', 'hover')}
              {...colorScheme.set('color', 'text')}
            >
              {getInitials(me)}
            </span>
          ))}
        {!me && <SignInLink />}
      </span>
    </button>
  )
}

const styles = {
  user: css(plainButtonRule, {
    cursor: 'pointer',
    opacity: 'inherit',
    textAlign: 'left',
    height: HEADER_HEIGHT,
    width: 'auto',
  }),
  button: css({
    display: 'inline-block',
    textDecoration: 'none',
    padding: `${BUTTON_PADDING}px`,
  }),
  portrait: css({
    position: 'relative',
    display: 'inline-block',
    verticalAlign: 'top',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...fontStyles.serifTitle,
    fontSize: BUTTON_SIZE / 2,
    lineHeight: `${BUTTON_SIZE + 5}px`,
    height: `${BUTTON_SIZE}px`,
    width: `${BUTTON_SIZE}px`,
  }),
  temporaryInitals: css({
    ':before': {
      // textContent is replaced by React while meLoading, we use a before element to work around that
      content: 'attr(data-initials)',
    },
  }),
  temporaryPortrait: css({
    display: 'none',
    '&[src]': {
      display: 'inline-block',
    },
  }),
  anonymous: css({
    display: 'none',
    '& svg': {
      display: 'inline',
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
    },
    [mediaQueries.mUp]: {
      display: 'inline-block',
    },
  }),
  label: css({
    display: 'inline-block',
    verticalAlign: 'middle',
    marginLeft: 5,
    ...fontStyles.sansSerifRegular12,
    [mediaQueries.mUp]: {
      ...fontStyles.sansSerifRegular16,
    },
  }),
  stack: css({
    position: 'relative',
    height: `${BUTTON_SIZE}px`,
    width: `${BUTTON_SIZE}px`,
    '& > *': {
      position: 'absolute',
    },
  }),
}

export default User
