import { LoginForm } from '../login'

// This component is used in the trial flow when the user is not authenticated.
// It consists of two steps:
// 1. Submit email and receive a verification code via email
// 2. Request access with email/verification code
const RegisterForTrial = () => {
  return <LoginForm context='trial' />
}

export default RegisterForTrial
