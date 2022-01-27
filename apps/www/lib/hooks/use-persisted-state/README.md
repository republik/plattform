Based on https://github.com/donavon/use-persisted-state/tree/beb9458a5e2144d8f50bd33dbf17429eff1316ec

- modified to handle local storage exceptions
- and provide supported info

```js
import createPersistedState from '../../lib/hooks/use-persisted-state'
const useCounterState = createPersistedState('count')

function MyComponent () {
  const [count, setCount, isPersisted] = useCounterState(initialCount)
}
```
