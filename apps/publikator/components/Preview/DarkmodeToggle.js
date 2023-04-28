import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import { IconDarkMode, IconLightMode } from '@republik/icons'

function DarkmodeToggle({ previewDarkmode, onToggle }) {
  const [colorScheme] = useColorContext()
  return (
    <button {...plainButtonRule} onClick={() => onToggle()}>
      {previewDarkmode ? (
        <IconLightMode
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      ) : (
        <IconDarkMode
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      )}
    </button>
  )
}

export default DarkmodeToggle
