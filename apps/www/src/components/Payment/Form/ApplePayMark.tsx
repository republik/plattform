import { css } from 'glamor'

const styles = {
  button: css({
    display: 'inline-block',
    WebkitAppearance: '-apple-pay-button',
    ApplePayButtonType: 'plain',
    ApplePayButtonStyle: 'white',
    borderRadius: 0,
    width: '100%',
    height: '44px',
  }),
}

const ApplePayMark = () => <span {...styles.button} />

export default ApplePayMark
