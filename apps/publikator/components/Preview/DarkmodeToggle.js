import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import { DarkModeIcon, LightModeIcon } from '@republik/icons/dist/icons.mjs'

function DarkmodeToggle({ previewDarkmode, onToggle }) {
  const [colorScheme] = useColorContext()
  return (
    <button {...plainButtonRule} onClick={() => onToggle()}>
      {previewDarkmode ? (
        <LightModeIcon
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      ) : (
        <DarkModeIcon
          {...colorScheme.set('fill', 'text')}
          width={26}
          height={26}
        />
      )}
    </button>
  )
}

export default DarkmodeToggle
