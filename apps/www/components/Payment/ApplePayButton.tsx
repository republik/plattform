import { css } from 'glamor'

const styles = {
  button: css({
    display: 'inline-block',
    '-webkit-appearance': '-apple-pay-button',
    '-apple-pay-button-type': 'plain',
    '-apple-pay-button-style': 'white',
    borderRadius: 0,
    width: '100%',
  }),
}

const ApplePayButton = () => <span {...styles.button} />

export default ApplePayButton
