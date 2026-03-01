import { Opaque } from '../../shared/types/opaque';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const TOKEN: unique symbol;
export type Token = Opaque<string, typeof TOKEN>;
