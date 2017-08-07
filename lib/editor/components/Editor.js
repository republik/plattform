import { Label, Interaction } from '@project-r/styleguide'
import StyleguideTheme from '../themes/styleguide'
import createEditor from '../'

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
  return <div style={{position: 'relative'}}>
    <div style={{position: 'fixed', top: '60px', left: 0}}>
      <Interaction.P>
        <Label>Format Text</Label>
        <br />
        {markButtons.map((Button, index) => <Button key={`mark-${index}`}{...props} />)}
        <Modules.Link.Components.LinkButton {...props} />
      </Interaction.P>

      <Interaction.P>
        <Label>Format Block</Label>
        {blockButtons.map((Button, index) => <Button key={`block-${index}`}{...props} />)}
      </Interaction.P>
      <Interaction.P>
        <Label>Insert</Label>
        <br />
        <Modules.Image.Components.AddImageButton {...props} />
      </Interaction.P>
    </div>
    <Editor {...props} />
  </div>
}
