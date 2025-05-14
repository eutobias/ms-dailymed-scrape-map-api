import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
  })
  username: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: 'strongPassword123',
    minLength: 8,
  })
  password: string;

  @ApiProperty({
    description: 'The access level of user',
    example: '1',
  })
  accesslevel: number;
}
