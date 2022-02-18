import { css } from 'glamor'

const styles = {
  button: css({
    display: 'inline-block',
    WebkitAppearance: '-apple-pay-button',
    ApplePayButtonType: 'plain',
    ApplePayButtonStyle: 'white',
    borderRadius: 0,
    width: '100%',
  }),
}

const ApplePayButton = () => <span {...styles.button} />

export default ApplePayButton
