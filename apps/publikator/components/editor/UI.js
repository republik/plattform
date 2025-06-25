import { useMemo } from 'react'
import { getFromModules } from './'
import { Interaction, Label, colors, IconButton } from '@project-r/styleguide'
import { IconPrint, IconCode } from '@republik/icons'
import Replace from './Replace'

const UISidebar = ({
  editorRef,
  value,
  onChange,
  onSaveSearchAndReplace,
  onGoToRaw,
}) => {
  const {
    textFormatButtons,
    blockFormatButtons,
    insertButtons,
    propertyForms,
  } = useMemo(() => {
    const { uniqModules } = editorRef

    return {
      textFormatButtons: getFromModules(
        uniqModules,
        (m) => m.ui && m.ui.textFormatButtons,
      ),
      blockFormatButtons: getFromModules(
        uniqModules,
        (m) => m.ui && m.ui.blockFormatButtons,
      ),
      insertButtons: getFromModules(
        uniqModules,
        (m) => m.ui && m.ui.insertButtons,
      ),
      propertyForms: getFromModules(uniqModules, (m) => m.ui && m.ui.forms),
    }
  }, [editorRef])

  if (!value) {
    return null
  }

  return (
    <>
      <div style={{ flex: 1, overflowY: 'auto', padding: '15px' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '12px' }}>
          {value.document.text.length}
          {' Zeichen'}
        </p>

        <div
          style={{
            display: 'flex',
            overflowX: 'scroll',
            width: '100%',
          }}
        >
          <IconButton onClick={window.print} Icon={IconPrint} label='Drucken' />
          <Replace value={value} onSave={onSaveSearchAndReplace} />
          <IconButton onClick={onGoToRaw} Icon={IconCode} label='Quellcode' />
        </div>
        <div style={{ margin: '24px 0' }}>
          <p style={{ fontSize: '16px', margin: '0 0 12px 0' }}>Text</p>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {textFormatButtons.map((Button, i) => (
              <Button key={`text-fmt-${i}`} value={value} onChange={onChange} />
            ))}
          </div>
        </div>
        <Interaction.P>
          <Label>Block</Label>
          {blockFormatButtons.map((Button, i) => (
            <Button key={`block-fmt-${i}`} value={value} onChange={onChange} />
          ))}
        </Interaction.P>
        <Interaction.P>
          <Label>Einfügen</Label>
          {insertButtons.map((Button, i) => (
            <Button key={`insert-${i}`} value={value} onChange={onChange} />
          ))}
        </Interaction.P>
      </div>
      {propertyForms.length > 0 && (
        <div
          style={{
            flex: '0 1 auto',
            maxHeight: '50%',
            padding: '20px 15px',
            width: '100%',
            overflowY: 'scroll',
            backgroundColor: colors.secondaryBg,
            borderTop: `1px solid ${colors.divider}`,
          }}
        >
          <div style={{ marginBottom: '36px' }}>
            {propertyForms.map((Form, i) => (
              <Form key={`form-${i}`} value={value} onChange={onChange} />
            ))}
          </div>
        </div>
      )}
    </>
  )
}

export default UISidebar
