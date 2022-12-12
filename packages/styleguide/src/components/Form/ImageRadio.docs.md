```react
state: {value: 'yes'}
---
<P>
  <ImageRadio
    value='yes'
    checked={state.value === 'yes'}
    onChange={(event) => setState({value: event.target.value})}
    imageUrl={'https://www.zumstein.ch/shop/resources/product_images_klein/15332969_kl.jpg'}>

    Ja
  </ImageRadio>
  <br />
  <ImageRadio
    value='no'
    checked={state.value === 'no'}
    onChange={(event) => setState({value: event.target.value})}
    imageUrl={'https://www.zumstein.ch/shop/resources/product_images_klein/15332969_kl.jpg'}>
    Nein
  </ImageRadio>
  <br />
  <ImageRadio
    value='maybe'
    disabled={true}
    onChange={(event) => setState({value: event.target.value})}
    imageUrl={'https://www.zumstein.ch/shop/resources/product_images_klein/15332969_kl.jpg'}>
    Vielleicht
  </ImageRadio>
  <br />
  <ImageRadio
    value='never'
    checked={true}
    disabled={true}
    onChange={(event) => setState({value: event.target.value})}
    imageUrl={'https://www.zumstein.ch/shop/resources/product_images_klein/15332969_kl.jpg'}>
    Niemals
  </ImageRadio>
</P>
```
