import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import MoonOutline from 'react-icons/lib/io/ios-moon-outline'
import Moon from 'react-icons/lib/io/ios-moon'

function DarkmodeToggle({ previewDarkmode, onToggle }) {
  const [colorScheme] = useColorContext()
  return (
    <button {...plainButtonRule} onClick={() => onToggle()}>
      {previewDarkmode ? (
        <Moon {...colorScheme.set('fill', 'text')} size={26} />
      ) : (
        <MoonOutline {...colorScheme.set('fill', 'text')} size={26} />
      )}
    </button>
  )
}

export default DarkmodeToggle
