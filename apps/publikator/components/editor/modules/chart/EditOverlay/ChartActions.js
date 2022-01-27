import React from 'react'
import { Button, A, Interaction } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  buttons: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15
  })
}

const ChartActions = ({ onSelect, values, config, cleanup, buttonText }) => {
  return (
    <div {...styles.buttons}>
      <Button onClick={() => onSelect(config, values, cleanup)}>
        {buttonText || 'Übernehmen'}
      </Button>
      <Interaction.P style={{ marginLeft: 30 }}>
        <A
          href='#copy-settings'
          onClick={() => onSelect(config, undefined, cleanup)}
        >
          Einstellungen kopieren
        </A>
      </Interaction.P>
    </div>
  )
}

export default ChartActions
