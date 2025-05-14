import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './infrastructure/persistence/user.repository';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserService } from './application/services/user.service';
import { PasswordUtils } from 'src/shared/infrastructure/utils/password.utils';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    PasswordUtils,
    JwtService,
  ],
  exports: ['IUserRepository', UserService],
})
export class UsersModule {}
