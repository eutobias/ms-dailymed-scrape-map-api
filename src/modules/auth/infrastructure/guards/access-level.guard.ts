import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';

@Injectable()
export class AccessLevelGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request as Request);

    if (!token) {
      throw new UnauthorizedException();
    }

    if (
      !this.jwtService.verify(token, {
        secret: this.configService.get<string>('jwtHash'),
      })
    ) {
      throw new UnauthorizedException();
    }

    const { accesslevel } = this.jwtService.decode(token);
    if (accesslevel < 1) {
      throw new UnauthorizedException();
    }

    const requiredLevel = this.reflector.get<number>(
      'accessLevel',
      context.getHandler(),
    );
    if (accesslevel < requiredLevel) {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers?.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
