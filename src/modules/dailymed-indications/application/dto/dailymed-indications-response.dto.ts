import { ApiProperty } from '@nestjs/swagger';

export class DailyMedIndicationsResponseDto {
  @ApiProperty({
    description: 'The dailymed indication',
  })
  indication: string;

  @ApiProperty({
    description: 'The descript of dailymed indication',
  })
  description: string;

  @ApiProperty({
    description: 'The ICD-10 code of dailymed indication',
  })
  code: string;
}
