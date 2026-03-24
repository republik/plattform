import { A, Field, Label } from '@project-r/styleguide'

import withDebouncedSearch from '@/components/Form/withDebouncedSearch'
import { css } from '@republik/theme/css'

export default withDebouncedSearch(({ search, onSearch }) => {
  const onSearchFor = (prefix) => {
    const [oldPrefix, term] = search.split(':')

    onSearch(`${prefix}:${term || oldPrefix || '<platzender Halter>'}`)
  }

  return (
    <div className={css({ borderBottom: `1px solid token(colors.divider)` })}>
      <div style={{ margin: '0 0 30px 0' }}>
        <Field
          label='Suche'
          type='text'
          value={search}
          onChange={(event, value) =>
            event.type === 'change' && onSearch(value)
          }
        />
        <Label>
          Suche nach ·&nbsp;
          <A href='#' onClick={() => onSearchFor('abo')}>
            Abo-Nr. (abo:…)
          </A>{' '}
          ·&nbsp;
          <A href='#' onClick={() => onSearchFor('code')}>
            Geschenkabo-Code (code:…)
          </A>{' '}
          ·&nbsp;
          <A href='#' onClick={() => onSearchFor('probe')}>
            Probelesen-Code. (probe:…)
          </A>{' '}
          ·&nbsp;
          <A href='#' onClick={() => onSearchFor('hrid')}>
            Payment HR-ID (hrid:…)
          </A>{' '}
          ·&nbsp;
          <A href='#' onClick={() => onSearchFor('adr')}>
            Adresse (adr:…)
          </A>
        </Label>
      </div>
    </div>
  )
})
