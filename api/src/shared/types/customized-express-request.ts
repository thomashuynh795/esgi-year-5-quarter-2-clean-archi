import { Request } from 'express';

export interface CustomizedExpressRequest extends Request {
  user: {
    id: string;
  };
}
