import { Request } from 'express';

export interface CustomisedExpressRequest extends Request {
    user: {
        id: string;
        role: string;
    };
}
