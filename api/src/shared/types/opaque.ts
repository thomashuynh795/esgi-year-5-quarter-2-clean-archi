export type Opaque<T, Tag extends symbol> = T & { readonly __opaque__: Tag };
