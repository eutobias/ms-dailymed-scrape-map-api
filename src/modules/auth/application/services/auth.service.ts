import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../../users/application/services/user.service';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from '../dto/login.dto';
import { TokenDto } from '../dto/token.dto';
import { PasswordUtils } from '../../../../shared/infrastructure/utils/password.utils';
import { TokenUserDataDto } from '../dto/token-user-data.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly passwordUtils: PasswordUtils,
  ) {}

  async validateUser(data: LoginDto): Promise<TokenUserDataDto> {
    const { username, password } = data;
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordUtils.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      username: user.username,
      accesslevel: user.accesslevel,
    };
  }

  async login(user: LoginDto): Promise<TokenDto> {
    const payload = await this.validateUser(user);

    const jwtHash = this.configService.get<string>('jwtHash');
    return {
      access_token: this.jwtService.sign(payload, { secret: jwtHash }),
    };
  }
}
