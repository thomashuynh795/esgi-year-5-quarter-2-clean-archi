import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CustomizedExpressRequest } from '../../../shared/types/customized-express-request';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<CustomizedExpressRequest>();
    const platform = req.query.platform;

    const state = { platform: platform || 'web' };
    const stateString = Buffer.from(JSON.stringify(state)).toString('base64');

    return { state: stateString };
  }
}
