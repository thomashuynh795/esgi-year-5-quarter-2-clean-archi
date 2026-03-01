export type DecodedToken = {
  sub: string;
  iat: number;
  exp: number;
} | null;
