import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PasswordUtils } from 'src/shared/infrastructure/utils/password.utils';
import { UsersModule } from '../users/users.module';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './infrastructure/controllers/auth.controller';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, JwtService, PasswordUtils],
})
export class AuthModule {}
