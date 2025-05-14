import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DailyMedIndicationsResponseDto } from '../../application/dto/dailymed-indications-response.dto';
import { DailymedIndicationsService } from '../../application/services/dailymed-indications.service';

@ApiTags('Programs')
@Controller('api/v1/programs')
export class ProgramsController {
  constructor(
    private readonly dailymedIndicationsService: DailymedIndicationsService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Find programs by ID' })
  @ApiParam({ name: 'id', description: 'Programs ID' })
  @ApiResponse({
    status: 200,
    description: 'program found',
    type: DailyMedIndicationsResponseDto,
  })
  @ApiResponse({ status: 404, description: 'program not found' })
  async findById(
    @Param('id') id: number,
  ): Promise<DailyMedIndicationsResponseDto> {
    return (await this.dailymedIndicationsService.findById(
      id,
    )) as DailyMedIndicationsResponseDto;
  }

  @Get()
  @ApiOperation({ summary: 'List all programs' })
  @ApiResponse({
    status: 200,
    description: 'List of indications',
    type: [DailyMedIndicationsResponseDto],
  })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  async findAll(
    @Query('query') query: string = '',
  ): Promise<DailyMedIndicationsResponseDto[]> {
    return await this.dailymedIndicationsService.findAll(query);
  }
}
