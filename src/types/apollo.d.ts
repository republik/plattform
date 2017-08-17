interface AsyncIterator<T> {
  next(value?: any): Promise<IteratorResult<T>>
  return?(value?: any): Promise<IteratorResult<T>>
  throw?(e?: any): Promise<IteratorResult<T>>
}

interface AsyncIterable<T> {
    [key: string]: AsyncIterator<T>
}
