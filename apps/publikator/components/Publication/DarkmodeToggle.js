import { useColorContext, plainButtonRule } from '@project-r/styleguide'
import { BsMoonFill as Moon, BsMoon as MoonOutline } from 'react-icons/bs'

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
