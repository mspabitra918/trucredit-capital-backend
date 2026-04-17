import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    _context: ExecutionContext,
  ): TUser {
    if (err || !user) {
      const name = info?.name;
      if (name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expired');
      }
      if (name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.message === 'No auth token') {
        throw new UnauthorizedException('Missing auth token');
      }
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
