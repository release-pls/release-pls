export type Enabled<T> = Exclude<T, false>;

export type Overwrite<T, U> = Omit<T, keyof U> & U;
export type MarkPartial<T, K extends keyof T> = Omit<Required<T>, K> &
  Partial<Pick<T, K>>;
