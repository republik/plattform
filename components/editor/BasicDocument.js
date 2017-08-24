import { NarrowContainer, Interaction, Label } from '@project-r/styleguide'
import marks, {
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton
} from './modules/marks'
import title, {
  TitleButton
} from './modules/title'
import lead, {
  LeadButton
} from './modules/lead'
import paragraph, {
  ParagraphButton
} from './modules/paragraph'
import link, {
  LinkButton,
  LinkForm
} from './modules/link'
import image, {
  ImageForm,
  ImageButton
} from './modules/image'

import cover from './modules/cover'

const plugins = [
  ...marks.plugins,
  ...title.plugins,
  ...lead.plugins,
  ...paragraph.plugins,
  ...link.plugins,
  ...image.plugins,
  ...cover.plugins
]

const textFormatButtons = [
  BoldButton,
  ItalicButton,
  UnderlineButton,
  StrikethroughButton,
  LinkButton
]

const blockFormatButtons = [
  TitleButton,
  LeadButton,
  ParagraphButton
]

const insertButtons = [
  ImageButton
]

const propertyForms = [
  LinkForm,
  ImageForm
]

export default ({
  state,
  onChange,
  onClaimLock,
  onReleaseLock,
  Container,
  Sidebar,
  Document,
  Editor
}) => {
  return <Container>
    <Sidebar
    >
      <Interaction.P>
        <Label>Format Text</Label>
        <br />
        {textFormatButtons.map((Button, i) => (
          <Button
            key={`text-fmt-${i}`}
            state={state}
            onChange={onChange}
            />
          ))
        }
      </Interaction.P>
      <Interaction.P>
        <Label>Format Block</Label>
        {
          blockFormatButtons.map((Button, i) => (
            <Button
              key={`block-fmt-${i}`}
              state={state}
              onChange={onChange}
            />
          ))
        }
      </Interaction.P>
      <Interaction.P>
        <Label>Insert</Label>
        {
          insertButtons.map((Button, i) => (
            <Button
              key={`insert-${i}`}
              state={state}
              onChange={onChange}
            />
          ))
        }
      </Interaction.P>
      <Interaction.P>
        <Label>Properties</Label>
        <br />
        {
          propertyForms.map((Form, i) => (
            <Form
              key={`form-${i}`}
              state={state}
              onChange={onChange}
              />
          ))
        }
      </Interaction.P>
    </Sidebar>
    <Document>
      <NarrowContainer>
        <Editor
          state={state}
          onChange={onChange}
          plugins={plugins}
      />
      </NarrowContainer>
    </Document>
  </Container>
}
