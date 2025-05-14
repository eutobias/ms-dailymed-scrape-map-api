import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../application/dto/create-user.dto';
import { UpdateUserDto } from '../../application/dto/update-user.dto';
import { UserResponseDto } from '../../application/dto/user-response.dto';
import { UserService } from '../../application/services/user.service';
import { AccessLevelGuard } from '../../../../modules/auth/infrastructure/guards/access-level.guard';
import { RequireAccessLevel } from '../../../../modules/auth/infrastructure/decorators/access-level.decorator';
import { Role } from '../../../../modules/auth/domain/enums/role.enum';

@ApiTags('Users')
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RequireAccessLevel(Role.USER)
  @UseGuards(AccessLevelGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async create(@Body() userData: CreateUserDto): Promise<UserResponseDto> {
    return (await this.userService.create(userData)) as UserResponseDto;
  }

  @RequireAccessLevel(Role.USER)
  @UseGuards(AccessLevelGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findById(@Param('id') id: number): Promise<UserResponseDto> {
    return (await this.userService.findById(id)) as UserResponseDto;
  }

  @RequireAccessLevel(Role.USER)
  @UseGuards(AccessLevelGuard)
  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({
    status: 200,
    description: 'List of users',
    type: [UserResponseDto],
  })
  async findAll(): Promise<UserResponseDto[]> {
    return (await this.userService.findAll()) as UserResponseDto[];
  }

  @RequireAccessLevel(Role.USER)
  @UseGuards(AccessLevelGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'User successfully updated',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id') id: number,
    @Body() userData: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return (await this.userService.update(id, userData)) as UserResponseDto;
  }

  @RequireAccessLevel(Role.USER)
  @UseGuards(AccessLevelGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User successfully deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id') id: number): Promise<void> {
    return await this.userService.delete(id);
  }
}
