import StyleguideTheme from '../themes/styleguide'
import createEditor from '../'
import HoverToolbar from './HoverToolbar'
import SideToolbar from './SideToolbar'

const { Editor, Modules } = createEditor(StyleguideTheme)

const markButtons = [
  Modules.Typography.Components.createMarkButton('Bold'),
  Modules.Typography.Components.createMarkButton('Italic'),
  Modules.Typography.Components.createMarkButton('Underline'),
  Modules.Typography.Components.createMarkButton('Strikethrough')
]

const blockButtons = [
  Modules.Typography.Components.createBlockButton('P'),
  Modules.Typography.Components.createBlockButton('H2'),
  Modules.Typography.Components.createBlockButton('Lead')
]

export default ({ ...props }) => {
  return <div>
    <HoverToolbar {...props}>
      {markButtons.map((Button, index) => <Button key={`mark-${index}`}{...props} />)}
      <Modules.Link.Components.LinkButton {...props} />
    </HoverToolbar>
    <SideToolbar {...props}>
      {blockButtons.map((Button, index) => <Button key={`block-${index}`}{...props} />)}
    </SideToolbar>
    <Editor {...props} />
  </div>
}
