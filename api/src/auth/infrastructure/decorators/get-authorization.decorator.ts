import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { decode } from 'jsonwebtoken';
import { DecodedToken } from '../../domain/types/decoded-token';
import { CustomizedExpressRequest } from '../../../shared/types/customized-express-request';

export const GetAuthorization = createParamDecorator(function (
  data: any,
  executionContext: ExecutionContext,
): DecodedToken {
  const request = executionContext
    .switchToHttp()
    .getRequest<CustomizedExpressRequest>();
  const authorization = request.headers['authorization'];
  if (!authorization) return null;

  const token = authorization.split(' ')[1];
  try {
    const decoded = decode(token);
    return decoded as DecodedToken;
  } catch (error: unknown) {
    console.error('Error decoding token:', error);
    return null;
  }
});
