/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
type DeeplyFrozen<T> = T extends (...args: any[]) => any
  ? T
  : T extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeeplyFrozen<U>>
    : T extends object
      ? { readonly [K in keyof T]: DeeplyFrozen<T[K]> }
      : T;

export function freezeDeeply<T>(value: T): DeeplyFrozen<T> {
  const seen = new WeakSet<object>();

  const freezeRec = (v: any): any => {
    if (v === null || typeof v !== 'object' || typeof v === 'function')
      return v;
    if (seen.has(v)) return v;
    seen.add(v);

    for (const key of [
      ...Object.getOwnPropertyNames(v),
      ...(Object.getOwnPropertySymbols(v) as any),
    ]) {
      const desc = Object.getOwnPropertyDescriptor(v, key);
      if (desc && 'value' in desc) freezeRec(desc.value);
    }

    return Object.freeze(v);
  };

  return freezeRec(value) as DeeplyFrozen<T>;
}
