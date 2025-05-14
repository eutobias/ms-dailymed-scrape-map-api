import { ApiProperty } from '@nestjs/swagger';

export class CreateDailyMedIndicationsDto {
  @ApiProperty({
    description: 'The dailymed indication',
    example: 'Atopic Dermatitis',
  })
  indication: string;

  @ApiProperty({
    description: 'The descript of dailymed indication',
    example: ' indicated for the treatment of adult and pediatric patients ...',
  })
  description: string;

  @ApiProperty({
    description: 'The ICD-10 code of dailymed indication',
    example: 'L20.9',
  })
  code: string;
}
