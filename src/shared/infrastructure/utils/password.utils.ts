import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PasswordUtils {
  constructor(private readonly configService: ConfigService) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const extraHashPassword = this.configService.get<string>('passwordHash');
    return await bcrypt.hash(password + extraHashPassword, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    const extraHashPassword = this.configService.get<string>('passwordHash');
    return await bcrypt.compare(password + extraHashPassword, hash);
  }
}
