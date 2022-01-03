Since end 2021, our Style Guide supports the use of [Typescript](https://www.typescriptlang.org/). Yay.

2021 was not that bad, after all.

## When to use Typescript

Whether or not to make use of Typescript is, much like the Covid vaccine, a personal decision. We do not enforce Typescript, but we do recommend you consider it, particularly for components involved with complex data structures (think: charts, editors, etc.).

## JS to TS

If you choose to go down the Typescript road, you will come across the need to convert existing Javascript components into Typescript. A few pointers below.

### File names

Many of our `.js` files contain JSX code, and thus, should be renamed to `.tsx` and not `.ts`.

### React generics

One quick and easy way to add types to an existing component is to make use of a couple of generics React provides.

#### `React.FC`

`React.FC` handles the return type of the component and automatically gives access to typed children (which may cause bugs in specific cases, but save some time in others).

```code|lang-js
const ArrowUp: React.FC<{
  size: number
  fill?: string 
}> = ({ size, fill, children }) => (
  <svg fill={fill} width={size} height={size} viewBox='0 0 24 24'>
    <path d='M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z' />
    <path d='M0 0h24v24H0z' fill='none' />
    {children}
  </svg>
)
```

#### `React.forwardRef`

Many interactive components forward a `ref` and use the `React.forwardRef` feature, which support types out of the box. The first parameter is the element type of the ref, and the second one, the props of the component itself. The `children` are included by default, as with `React.FC`. 

```code|lang-js
const Button = React.forwardRef<
  HTMLAnchorElement & HTMLButtonElement,
  {
    onClick?: MouseEventHandler<HTMLAnchorElement> &
      MouseEventHandler<HTMLButtonElement>
    type?: 'button' | 'submit' | 'reset'
    href?: string
    ...
  }
>(...)
```

*Note: the `Button` component can either be a button or a link, hence the two element types.*

### Misc

#### `Record`

Or, how to handle rest props without losing your mind. Actual example from our actual code: 

```code|lang-js
interface ArrowProps extends Record<string, unknown> {
  size: number
  fill?: string
}

const ArrowUp: React.FC<ArrowProps> = ({ size, fill, ...props }) => ...
```

We would rather not type the `...props`. However, we very much want types for `size` and `fill`. The [Record object](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type) serves us perfectly for this.

Admittedly, this isn't very useful in terms of type safety, but some type safety is always better than no type safety.
