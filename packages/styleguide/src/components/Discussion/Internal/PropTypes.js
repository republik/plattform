import PropTypes from 'prop-types'

export const DisplayAuthorPropType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  profilePicture: PropTypes.string,
  credential: PropTypes.shape({
    description: PropTypes.string.isRequired,
    verified: PropTypes.bool,
  }),
})
