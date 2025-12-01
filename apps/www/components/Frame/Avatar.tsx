import { css } from 'glamor'
import {
  fontStyles,
  plainButtonRule,
  useColorContext,
} from '@project-r/styleguide'
import NotificationIcon from '../Notifications/NotificationIcon'
import { MeObjectType } from '../../lib/context/MeContext'
import { ME_PORTRAIT_STORAGE_KEY } from '../../lib/context/MeContext'

const USER_IMAGE_SIZE = 32

export const getInitials = (me: MeObjectType): string =>
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

const User = ({
  me,
  title,
  onClick,
}: {
  me: MeObjectType
  title?: string
  onClick?: () => void
}) => {
  const [colorScheme] = useColorContext()

  if (!me)
    return (
      <>
        <div data-show-if-me='true' {...styles.stack}>
          <span
            suppressHydrationWarning
            data-temporary-initials=''
            {...styles.portraitImage}
            {...styles.temporaryInitals}
            {...colorScheme.set('backgroundColor', 'hover')}
            {...colorScheme.set('color', 'text')}
          />
          <img
            suppressHydrationWarning
            data-temporary-portrait=''
            {...styles.portraitImage}
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
    )

  return (
    <>
      <button {...styles.user} onClick={onClick} title={title}>
        {me.portrait ? (
          <img
            src={me.portrait}
            alt={me.name || me.email}
            {...styles.portraitImage}
          />
        ) : (
          <span
            {...styles.portraitInitials}
            {...colorScheme.set('backgroundColor', 'hover')}
            {...colorScheme.set('color', 'text')}
          >
            {getInitials(me)}
          </span>
        )}
        <NotificationIcon />
      </button>
    </>
  )
}

const styles = {
  user: css(plainButtonRule, {
    cursor: 'pointer',
    position: 'relative',
    ...plainButtonRule,
  }),
  portraitImage: css({
    height: USER_IMAGE_SIZE,
    width: USER_IMAGE_SIZE,
    objectFit: 'cover',
  }),
  portraitInitials: css({
    display: 'inline-block',
    verticalAlign: 'top',
    textAlign: 'center',
    textTransform: 'uppercase',
    ...fontStyles.serifTitle,
    fontSize: USER_IMAGE_SIZE / 2,
    lineHeight: `${USER_IMAGE_SIZE + 5}px`,
    height: `${USER_IMAGE_SIZE}px`,
    width: `${USER_IMAGE_SIZE}px`,
  }),
  stack: css({
    position: 'relative',
    height: `${USER_IMAGE_SIZE}px`,
    width: `${USER_IMAGE_SIZE}px`,
    '& > *': {
      position: 'absolute',
    },
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
}

export default User
