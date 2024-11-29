import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticationGuard } from 'src/guards/authentication.guard';
import { User } from './user.schema';

@ApiTags('User Section')
@Controller('users')
@UseGuards(AuthenticationGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('user')
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Get('list')
  async findAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Get('profile')
  async findOne(@Req() req): Promise<User> {
    return await this.userService.findOne(req.userId); // Fetch logged-in user's data
  }

  @Patch('profile')
  async update(
    @Req() req,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return await this.userService.update(req.userId, updateUserDto); // Update logged-in user
  }

  @Delete('profile')
  async remove(@Req() req): Promise<{ message: string }> {
    await this.userService.remove(req.userId);
    return { message: 'User successfully deleted' }; // Delete logged-in user
  }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(id);
  // }
}
