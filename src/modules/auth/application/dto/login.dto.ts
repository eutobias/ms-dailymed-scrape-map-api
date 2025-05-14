import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'johndoe',
    required: true,
  })
  username: string;

  @ApiProperty({
    description: 'The password for authentication',
    example: 'strongPassword123',
    required: true,
    minLength: 8,
  })
  password: string;
}
