import slugify from '../../../lib/utils/slug'
import { Field } from '@project-r/styleguide'

const slugChangeHandler = onChange => (event) =>
  onChange(event, slugify(event.target.value))

export default ({onChange, value, ...props}) => (
  <Field
    {...props}
    renderInput={
      props => <input {...props} onBlur={slugChangeHandler(onChange)} />
    }
    onChange={onChange}
    value={value}
  />
)
